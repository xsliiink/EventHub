import express,{Request,Response,NextFunction} from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import "./db";
import { off } from 'node:cluster';

//creating interface for user JWT data
interface TokenPayload {
    id: number;
    username: string;
}

//extending express Request interface to include user property
interface AuthRequest extends Request {
    user? : TokenPayload
}

interface RegisterBody{
    username: string;
    password: string;
    bio: string;
    hobbies: string;
}

interface hobbyRow{
    id: number;
    name: string;
}

interface userRow{
    id: number;
    username: string;
    password: string;
    bio?: string;
    avatar?: string;
}

interface LoginBody{
    username?: string;
    password?: string;
}

interface EventBody{
    name: string;
    description: string;
    location: string;
    date: string;
    'selectedHobbies[]'?: string | string[];
}

interface EventsQuery{
    location?: string;
    hobby?: string;
    official?: string;
}

interface EventRow{
    id: number;
    name:string;
    description: string;
    date: string;
    location: string;
    image?: string;
    creator_id: number;
    official: number;
    hobbies: string | null;
}

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/avatars' });
const eventUpload = multer({dest: 'uploads/events'});
const port = 3007;
const { Database } = sqlite3;
const db = new Database('./database.db');
const JWT_SECRET = process.env.JWT_SECRET as string;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/api/register", upload.single("avatar"), async (req : Request<{},{},RegisterBody>, res: Response) => {

  try{
    const {username,password,bio} = req.body;
    const avatar = req.file ? req.file.filename : null;
    const hobbies : string[] = JSON.parse(req.body.hobbies || '[]');

    const hashedPassword = await bcrypt.hash(password,10);

    db.run(
        `INSERT INTO users (username,password,bio,avatar) VALUES (?,?,?,?)`,
        [username,hashedPassword,bio,avatar],
        function(this: sqlite3.RunResult,err: Error | null){
            if (err) return res.status(400).json({error : err.message});

            const userId = this.lastID;

            if(!hobbies.length){
                return res.json({message: 'User registered successfully',userId});
            };

            const stmt = db.prepare(`INSERT INTO user_hobbies (user_id,hobby_id) VALUES (?,?)`);
            let completed = 0;

            const finalize = () => {
                completed++;
                if(completed === hobbies.length){
                    stmt.finalize();
                    res.json({message:'User registered succesfully',userId});
                }
            }

            hobbies.forEach((hobbyName : string) => {
                db.get(`SELECT id FROM hobbies WHERE name = ? `,[hobbyName], (err : Error | null,row? : hobbyRow) => {
                    if(err){
                        console.error('Error fetching hobby', err);
                        finalize();
                        return;
                    }
                    if(row){
                        stmt.run(userId,row.id, (err: Error | null) => {
                            if (err) console.error('Error inserting user_hobby', err);
                            finalize();
                        });
                    }else{
                        console.warn(`Hobby "${hobbyName}" was not found in the table hobbies`);
                        finalize();
                    }
                })
            })
        }
    );

  }catch(err){
    const error = err as Error;
    console.error('Registration error:',error.message);
    res.status(500).json({error: 'Server error'});
  }
});

app.post("/api/login", (req: Request<{},{},LoginBody>,res : Response) => {
    console.log("Login route hit");

    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({error: 'Username and password are required!'});
    }

    db.get('SELECT * FROM users WHERE username = ?',[username], async (err: Error | null,user? : userRow) => {
        if (err) {
            console.error(err);
            return res.status(500).json({error: 'DB error'});
        }

        if (!user){
             return res.status(400).json({error: 'User not found'});
        } 

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({error: 'Invalid password'});

        const tokenPayload = {
            id : user.id,
            username: user.username
        }

        const token = jwt.sign(
            {id:user.id,username: user.username},
            process.env.JWT_SECRET as string,
            {expiresIn: '1h'}
        );

        res.json({
            message: 'Login successfull',
            token,
            user : {
                id: user.id,
                username: user.username,
                bio: user.bio,
                avatar: user.avatar,
            },
        });
    });
});

app.post('/api/events',eventUpload.single('eventImage'), async (req: AuthRequest,res: Response) =>{

    console.log('req.body:', req.body);       // что пришло в body
    console.log('req.file:', req.file);       // что пришло в файле
    console.log('req.user:', req.user);       // если используешь токен

    try{
        const {name,description,location,date} = req.body;
        const rawHobbies = req.body['selectedHobbies[]'] || [];
        const selectedHobbies = Array.isArray(rawHobbies) ? rawHobbies : [rawHobbies];

        const eventImage = req.file ? req.file.filename : null;
        const creator_id = req.user?.id || null;//проверка токена и юзера
        const official = 0;

        if(!name || !description || !date){
            return res.status(400).json({error:'Required fields are missing'});
        }
        
        db.run(
            `INSERT INTO events (name,description,date,location,image,creator_id,official)
            VALUES (?,?,?,?,?,?,?)`,
            [name,description,date,location,eventImage,creator_id,official],
            function(this: sqlite3.RunResult, err: Error | null){
                if (err) return res.status(500).json({error: err.message});

                const eventId = this.lastID;

                const insertHobbies = async () => {
                    if (!Array.isArray(selectedHobbies) || selectedHobbies.length === 0) return;

                    const stmt = db.prepare(`INSERT INTO event_hobbies (event_id,hobby_id) VALUES (?,?)`);

                    const promises = selectedHobbies.map(hobbyName => {
                        return new Promise<void>((resolve, reject) => {

                            db.get(`SELECT id FROM hobbies WHERE name = ?`, [hobbyName], (err: Error | null, row?: hobbyRow) => {
                                if (err) return reject(err);
                                if (row) {
                                    stmt.run(eventId, row.id, (runErr: Error | null) => {
                                        if (runErr) reject(runErr);
                                        else resolve();
                                    });
                                } else resolve();
                            });
                        });
                    });

                    await Promise.all(promises);
                    stmt.finalize();
                };

                insertHobbies()
                    .then(() => res.json({ message: 'Event created', eventId }))
                    .catch(err => res.status(500).json({ error: err.message }));
            }
        );
    }catch(err){
        console.error('Error creating event: ',err);
        res.status(500).json({error: 'Server error'});
    }
})

app.get('/api/hobbies',(req,res) => {
    db.all("SELECT * FROM hobbies",[], (err : Error | null,rows: hobbyRow[]) =>{
        console.log('Hobbies request received');
        if (err){
                console.error('DB error:', err.message);
                return res.status(500).json({error:"DB error"});
        }
        res.json(rows);
    })
})

app.get('/api/events', (req : Request<{},{},{},EventsQuery>,res: Response) => {
    const {location,hobby,official} = req.query;

    let query = `
        SELECT e.*, GROUP_CONCAT(h.name) as hobbies
        from events e
        LEFT JOIN event_hobbies eh ON e.id = eh.event_id
        LEFT JOIN hobbies h ON eh.hobby_id = h.id
        WHERE 1 = 1
    `;

    const params: any[] =[];

    if(location){
        query += ` AND e.location = ?`;
        params.push(location);
    }

    if(official){
        query += ` AND e.official = ?`;
        params.push(official === 'true' || official === '1' ? 1: 0);
    }

    if(hobby){
        query += ` AND h.name = ?`;
        params.push(hobby);
    }


    query += ` GROUP BY e.id ORDER BY e.date ASC`;

    db.all(query,params, (err: Error | null,rows: EventRow[]) => {
        if(err){
            console.error(err);
            return res.status(500).json({error : err.message});
        }
        
        const formatted = rows.map((r: EventRow) => ({
            ...r,
            hobbies: r.hobbies ? r.hobbies.split(',') : []
        }));

        console.log("🧠 Events before send:", formatted);
        res.json(formatted);
    })
})

app.listen(port, () => console.log(`Server running on port ${port}`));
