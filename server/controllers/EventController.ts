import {Response,Request} from 'express';

import  db  from '../db';
import {dbRun,dbGet,dbExec} from '../db';
import sqlite3 from 'sqlite3';

import { hobbyRow,EventRow,EventsQuery,PaginatedResponse } from '@shared/types';
import { AuthRequest } from '../types/index';

import {updateEventSchema,createEventSchema} from '../validation/event'
import {mapEventRowToSocialEvent} from '../mappers/event.mapper'
import { replaceEventImage } from '../services/event.service'
import { getPaginationParams,formatPaginatedResponse } from '../utils/pagination';


export const createEvent = async(
    req: AuthRequest,
    res: Response
) => {
    try{

        //Entry + Validation
        const parsed = createEventSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                error: 'invalid request body',
                details: parsed.error.flatten()
            });
        }

        const {title,description,location,date,selectedHobbies = []} = parsed.data;

        const eventImage = req.file ? req.file.filename : null;
        const creator_id = req.user?.id;//проверка токена и юзера
        const official = 0;
        const socketIo = req.app.get('io');


        //Security Check
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: You must be logged in' });
        }

        //Inserting event into DB
        const result = await dbRun(
            `
            INSERT INTO events (name,description,date,location,image,creator_id,official)
            VALUES (?,?,?,?,?,?,?)
            `,
            [title,description,date,location,eventImage,creator_id,official],
        ) as sqlite3.RunResult;

        const eventId = result.lastID;

        //Linking hobbies to event
        if(selectedHobbies.length > 0){
            for (const hobbyName of selectedHobbies){
                const hobby = await dbGet(
                    `SELECT id FROM hobbies WHERE name = ?`,
                    [hobbyName]
                ) as hobbyRow | undefined;

                if(hobby){
                    await dbRun(
                        `INSERT INTO event_hobbies (event_id,hobby_id) VALUES (?,?)`,
                        [eventId,hobby.id]
                    );
                }
            }
        }

        //Getting fresh event for socket
        const freshEvent = await dbGet(`
                SELECT
                    e.id,
                    e.name,
                    e.description,
                    e.date,
                    e.location,
                    e.image,
                    e.creator_id,
                    e.official,
                    GROUP_CONCAT(h.name) as hobbies
                FROM events e
                LEFT JOIN event_hobbies eh ON e.id = eh.event_id
                LEFT JOIN hobbies h ON eh.hobby_id = h.id
                WHERE e.id = ?
                GROUP BY e.id
                `,[eventId],
            ) as EventRow;

        //Socket  + Response
        const fullEvent = mapEventRowToSocialEvent(freshEvent);

        socketIo?.emit('event:created',fullEvent);

        return res.status(201).json({message: 'Event created', eventId});
    
    }catch(err: unknown){
            console.error('Error creating event: ',err);
           if (!res.headersSent) {
            const errorMessage = err instanceof Error ? err.message : 'Server error';
            res.status(500).json({ error: errorMessage });
        }
    }
}

export const getEvents = (
    req : Request<Record<string,never>,Record<string,never>,Record<string,never>,EventsQuery>,
    res: Response
) => {
    const {page,limit,offset} = getPaginationParams(req.query);
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

        query += ` GROUP BY e.id ORDER BY e.date ASC LIMIT ? OFFSET ?`;
        params.push(limit,offset);
    
        db.all(query,params, (err: Error | null,rows: EventRow[]) => {
            if(err){
                console.error(err);
                return res.status(500).json({error : err.message});
            }
            
            const formatted = rows.map(mapEventRowToSocialEvent);
            res.json(formatPaginatedResponse(formatted,page,limit));
        })
}

export const deleteEvent = async (
    req: AuthRequest & {params: {id: string}},
     res: Response
) => {
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
        res.status(500).json({error: 'Internal server error',err});
    }
}

export const updateEvent = async (
    req: AuthRequest & {params: {id: string}},
    res: Response
) => {
    try{

        //Entry + Validation
        const {id} = req.params;
        const userId = req.user?.id;

        const parsed = updateEventSchema.safeParse(req.body);

        if(!parsed.success){
            return res.status(400).json({
                error: 'Invalid request body',
                details: parsed.error.flatten()
            });
        }

        const {title,description,date,location} = parsed.data;
        const eventImage = req.file ? req.file.filename : undefined;

        //Security check
        const event = await dbGet(
            `SELECT creator_id,image FROM events WHERE id = ?`,
            [id]
            ) as EventRow | undefined;

        if (!event){
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.creator_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        //UPDATE preparation 
        type SqlValue = string | number | null;

        const updatedFields: string[] = [];
        const values: SqlValue[] = [];

        const eventName = title;

        if(eventName){
            updatedFields.push('name = ? ');
            values.push(eventName);
        }

        if (description) {
            updatedFields.push('description = ?');
            values.push(description);
        }
        if (date) {
             updatedFields.push('date = ?');
            values.push(date);
        }
        if (location) {
             updatedFields.push('location = ?');
            values.push(location);
        }

        if(!updatedFields.length && !eventImage){
            return res.status(400).json({ error: 'No fields to update' });
        }

        //Transaction
        await dbExec('BEGIN TRANSACTION');

        try{
            //Updating fields
            if (updatedFields.length){
                values.push(Number(id));

                const updateSql = `
                    UPDATE events
                    SET ${updatedFields.join(', ')}
                    WHERE id = ? 
                `

                await dbRun(updateSql,values);
            }

            //Service - Working on Image
             await replaceEventImage(Number(id),eventImage)

             await dbExec('COMMIT')
        }catch(err: unknown){
            await dbExec('ROLLBACK');
            throw err;
        }


        //Getting an updated event
        const updatedEvent = await dbGet(
            `
            SELECT 
                e.id,
                e.name,
                e.description,
                e.date,
                e.location,
                e.image,
                e.creator_id,
                e.official,
                GROUP_CONCAT(h.name) AS hobbies
            FROM events e 
            LEFT JOIN event_hobbies eh ON e.id = eh.event_id
            LEFT JOIN hobbies h ON eh.hobby_id = h.id
            WHERE e.id = ?
            GROUP BY e.id
            `,[id]
        ) as EventRow;

        const fullEvent =  mapEventRowToSocialEvent(updatedEvent);


        //Socket
        const socketIo = req.app.get('io');
        if(socketIo){
            socketIo.emit('event:updated',fullEvent);
        }

        res.json(fullEvent);
    }catch(err: unknown){
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).json({error: 'Internal server error'})
    }
}
