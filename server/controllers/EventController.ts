import {Response,Request} from 'express';
import  db  from '../db';
import sqlite3 from 'sqlite3';
import { EventBody, hobbyRow,EventRow, SocialEvent } from '@shared/types';
import { AuthRequest } from '../types/index';
import { EventsQuery } from '@shared/types';
import {io} from '../server';
import { resolve } from 'node:dns';

export const createEvent = async(req: AuthRequest & {body: EventBody}, res: Response) => {
    try{
            const {name,description,location,date} = req.body;
            const rawHobbies = req.body.selectedHobbies || req.body['selectedHobbies[]'] || [];
            const selectedHobbies: string[] = Array.isArray(rawHobbies) 
                ? rawHobbies 
                : (rawHobbies ? [rawHobbies] : []);

            const eventImage = req.file ? req.file.filename : null;
            const creator_id = req.user?.id;//проверка токена и юзера
            const official = 0;
            const socketIo = req.app.get('io');

            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized: You must be logged in' });
            }

            if(!name || !description || !date){
                return res.status(400).json({error:'Required fields are missing'});
            }
            
            //Inserting event into DB
            const eventId = await new Promise<number>((resolve,reject) => {
                db.run(
                `INSERT INTO events (name,description,date,location,image,creator_id,official)
                VALUES (?,?,?,?,?,?,?)`,
                [name,description,date,location,eventImage,creator_id,official],
                function(this: sqlite3.RunResult, err: Error | null){
                    if(err){
                        console.error("🚨 Ошибка SQL events:", err.message);
                        reject(err);
                    }else{
                        console.log("✅ Событие создано, ID:", this.lastID);
                        resolve(this.lastID);
                    }
                })
            })

            //Linking hobbies to event
            if(selectedHobbies.length > 0){
                for (const hobbyName of selectedHobbies){
                    await new Promise<void>((resolve,reject) => {
                        db.get(`SELECT id FROM hobbies WHERE name = ?`, [hobbyName], (err: Error | null, row?: hobbyRow) => {
                        if (err) return reject(err);
                        if (row){
                            db.run(`INSERT INTO event_hobbies (event_id, hobby_id) VALUES (?,?)`,
                                [eventId, row.id], (runErr: Error | null) => {
                                if (runErr) reject(runErr);
                                else resolve();
                                });
                            }else{
                                resolve();  
                            }       
                        })
                    })
                }
            }

            const freshEvent = await  new Promise<SocialEvent>((resolve,reject) => {
                db.get(`
                    SELECT
                        e.id,e.name,e.description,e.date,e.location,e.image,e.creator_id,e.official,
                        GROUP_CONCAT(h.name) as hobbies
                    FROM events e
                    LEFT JOIN event_hobbies eh ON e.id = eh.event_id
                    LEFT JOIN hobbies h ON eh.hobby_id = h.id
                    WHERE e.id = ?
                    GROUP BY e.id
                    `,[eventId], (err: Error | null, row?: EventRow) => {
                        if(err){
                            reject(err);
                        }else if(!row){
                            reject(new Error('Event not found after creation'));
                        }else{
                            resolve({
                                id: row.id,
                                //Mapping name from DB to title for client
                                title: row.name,
                                description: row.description,
                                date: row.date,
                                location: row.location,
                                image: row.image || null,
                                creator_id: row.creator_id,
                                official: row.official,
                                //Transforming hobbies from CSV to array
                                hobbies: typeof row.hobbies === 'string' ? row.hobbies.split(',') : []
                        });
                    }
                })
            })

            if (socketIo) {
                socketIo.emit('event:created', freshEvent);
                console.log("📡 Сокет: Сигнал отправлен для ивента ID:", eventId);
            } else {
                console.error("🚨 Сокет: Объект io не найден в req.app");
            }
            return res.status(200).json({message: 'Event created', eventId});

            
    }catch(err: unknown){
            console.error('Error creating event: ',err);
           if (!res.headersSent) {
            const errorMessage = err instanceof Error ? err.message : 'Server error';
            res.status(500).json({ error: errorMessage });
        }
    }
}

export const getEvents = (req : Request<Record<string,never>,Record<string,never>,Record<string,never>,EventsQuery>,res: Response) => {
    const {location,hobby,official} = req.query;
    
        let query = `
            SELECT e.*, GROUP_CONCAT(h.name) as hobbies
            from events e
            LEFT JOIN event_hobbies eh ON e.id = eh.event_id
            LEFT JOIN hobbies h ON eh.hobby_id = h.id
            WHERE 1 = 1
        `;
    
        const params: (string | number)[] = [];
    
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
            res.json(formatted);
        })
}

export const deleteEvent = async (req: AuthRequest & {params: {id: string}}, res: Response) => {
    try{
        const { id } = req.params;
        const userId = req.user?.id;

        const event = await new Promise<EventRow | undefined>((resolve,reject) => {
            db.get(`SELECT creator_id FROM events WHERE id = ?`,[id], (err: Error | null,row: EventRow) => {
                if(err) reject(err);
                else resolve(row);
            });
        });

        if(!event) return res.status(404).json({error: 'Event not found'});
        if (event.creator_id !== userId) return res.status(403).json({error: 'Access denied'});

        await new Promise<void>((resolve,reject) => {
            db.run(`DELETE FROM events WHERE id = ?`, [id], (err: Error | null) => {
                if(err) reject(err);
                else resolve();
            })
        });

        const socketIo = req.app.get('io');
        if(socketIo){
            //sending only the ID of deleted event
            socketIo.emit('event:deleted',Number(id));
            console.log(`Socket:  Event ${id} is deleted`);
        }

        res.status(200).json({message: 'Event deleted successfully'});
    }catch(err: unknown){
        res.status(500).json({error: 'Internal server error'});
    }
}