import {Request,Response} from 'express';
import bcrypt from 'bcrypt';
import  db  from '../db'
import  sqlite3  from 'sqlite3';
import {RegisterBody,hobbyRow,LoginBody,userRow} from '@shared/types';
import jwt from 'jsonwebtoken';
import {config} from '../config/index';

export const register = async( req : Request<Record<string,never>,Record<string,never>,RegisterBody>, res: Response) => {
    try{
        const {username,password,bio} = req.body;
        const avatar = req.file ? req.file.filename : null;
        const hobbies : string[] = JSON.parse(req.body.hobbies || '[]');
    
        const hashedPassword = await bcrypt.hash(password,10);
    
        db.run(
            `INSERT INTO users (username,password,bio,avatar) VALUES (?,?,?,?)`,
            [username,hashedPassword,bio,avatar],
            function(this: sqlite3.RunResult,err: Error | null){
                if (err){
                    console.error("!!! SQLITE ERROR IN REGISTER:", err.message)
                    return res.status(400).json({error : err.message});
                }
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
                        res.json({message:'User registered successfully',userId});
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
        console.error('FULL ERROR:', error);
        res.status(500).json({error: 'Server error'});
      }
}

export const login = (req: Request<Record<string,never>,Record<string,never>,LoginBody>,res : Response) => {
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
            tokenPayload,
            config.JWT_SECRET as string,
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
}
