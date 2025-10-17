import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import "./db.js";

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/avatars' });
const eventUpload = multer({dest: 'uploads/events'});
const port = 3007;
const { Database } = sqlite3;
const db = new Database('./database.db');
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/api/register", upload.single("avatar"), async (req, res) => {

  try{
    const {username,password,bio} = req.body;
    const avatar = req.file ? req.file.filename : null;
    const hobbies = JSON.parse(req.body.hobbies || '[]');


    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const hashedPassword = await bcrypt.hash(password,10);
    console.log("Hashed password: ",hashedPassword);

    db.run(
        `INSERT INTO users (username,password,bio,avatar) VALUES (?,?,?,?)`,
        [username,hashedPassword,bio,avatar],
        function(err){
            if (err) return res.status(400).json({error : err.message});

            const userId = this.lastID;

            console.log("Inserted user id:", this.lastID);
            res.json({message: 'User registered successfully',userId: this.lastID});
        }
    );

    if(!hobbies.length){
        return res.json({message: 'User registered successfully',userId});
    }

    const stmt = db.prepare(`INSERT INTO user_hobbies (user_id,hobby_id) VALUES (?,?)`);

    let completed = 0;

    hobbies.forEach((hobbyName) => {
        db.get(`SELECT id FROM hobbies WHERE name = ? `,[hobbyName], (err,row) => {
            if (err){
                console.error('Error fetching hobby', err);
            }

            if(row){
                stmt.run(userId,row.id, (err) => {
                    if (err) console.error('Error inserting user_hobby', err);

                    completed++;
                    if(completed === hobbies.length){
                        stmt.finalize();
                        res.json({message: 'User registered successfully',userId});
                    }
                });
            }else{
                console.warn(`Hobby "${hobbyName}" was not found in the table hobbies`);
                completed++;
                if(completed === hobbies.length){
                    stmt.finalize();
                    res.json({message: "User registered successfully"});
                }
            }
        })
    })
  }catch(err){
    console.error('Error:', err);
    res.status(500).json({error: 'Server error'})
  }
});

app.post("/api/login", (req,res) => {


    console.log("Login route hit");

    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({error: 'Username and password are required!'});
    }

    db.get('SELECT * FROM users WHERE username = ?',[username], async (err,user) => {
        if (err) return res.status(500).json({error: 'DB error'});
        if (!user) return res.status(400).json({error: 'User not found'});

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({error: 'Invalid password'});

        const token = jwt.sign(
            {id:user.id,username: user.username},
            JWT_SECRET,
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


// app.get('/api/events', (req,res) => {
//     const {hobby,official} = req.query;//чтобы фильровать
//     let query = "SELECT * FROM events where 1=1";
//     const params = [];

//     if (hobby){
//         query += "AND hobby = ?";
//         params.push(hobby);
//     }

//     if(official){
//         query += "AND official = ?";
//         params.push(official);
//     }


//     db.all(query,params, (err,rows) => {
//         if (err) return res.status(500).json({error: err.message});
//         res.json(rows);
//     })
// })

app.post('/api/events',eventUpload.single('eventImage'), (req,res) =>{

    console.log('req.body:', req.body);       // что пришло в body
    console.log('req.file:', req.file);       // что пришло в файле
    console.log('req.user:', req.user);       // если используешь токен

    try{
        const {name,description,location,date} = req.body;
        const selectedHobbies = req.body['selectedHobbies[]'] || []
        const eventImage = req.file ? req.file.filename : null;
        const creator_id = req.user?.id || null;//проверка токена и юзера
        const official = 0;

        if(!name || !description || !date){
            return res.status(400).json({error:'Error occured poop'});
        }
        
        db.run(
            `INSERT INTO events (name,description,date,location,image,creator_id,official)
            VALUES (?,?,?,?,?,?,?)`,
            [name,description,date,location,eventImage,creator_id,official],
            function(err){
                if (err) return res.status(500).json({error: err.message});

                const eventId = this.lastID;

                //Вставляем хобби для события
                const stmt = db.prepare(
                    `INSERT INTO event_hobbies (event_id,hobby_id) VALUES (?,?)`
                );

                if (Array.isArray(selectedHobbies) && selectedHobbies.length > 0){
                    selectedHobbies.forEach(hobbyName => {
                        db.get(`SELECT id FROM hobbies WHERE name = ?`,[hobbyName], (err,row) =>{
                            if(row){
                                stmt.run(eventId,row.id)
                            }
                        });
                    });
                }

                stmt.finalize();

                res.json({message: 'Event created',eventId});
            }
        );
    }catch(err){
        console.error('Error creating event: ',err);
        res.status(500).json({error: 'Server error'});
    }
})

app.get('/api/hobbies',(req,res) => {
    db.all("SELECT * FROM hobbies",[], (err,rows) =>{
        console.log('request recieved');
        if (err) return res.status(500).json({error:"DB error"});
        res.json(rows);
    })
})

app.get('/api/events', (req,res) => {
    const {location,hobby,official} = req.query;
    let query = `
        SELECT e.*, GROUP_CONCAT(h.name) as hobbies
        from events e
        LEFT JOIN event_hobbies eh ON e.id = eh.event_id
        LEFT JOIN hobbies h ON eh.hobby_id = h.id
        WHERE 1 = 1
    `;

    const params =[];

    if(location){
        query += ` AND e.location = ?`;
        params.push(location);
    }

    if(official){
        query += ` AND e.official = ?`;
        params.push(official);
    }

    if(hobby){
        query += ` AND e.name = ?`;
        params.push(hobby);
    }


    query += ` GROUP BY e.id ORDER BY e.date ASC`;

    db.all(query,params, (err,rows) => {
        if(err) return res.status(500).json({error : err.message});
        
        const formatted = rows.map(r => ({
            ...r,
            hobbies: r.hobbies ? r.hobbies.split(',') : []
        }));

        res.json(formatted);
    })
})

app.listen(port, () => console.log(`Server running on port ${port}`));
