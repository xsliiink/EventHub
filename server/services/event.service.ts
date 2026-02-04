import fs from 'fs/promises'
import path from 'path'
import {dbGet,dbRun} from '../db'
import { EventRow } from '@shared/types'




export const replaceEventImage = async (
    eventId : number,
    newImage ?: string
): Promise<void> => {
    const event = await dbGet(
        'SELECT image FROM events WHERE id = ? ',
        [eventId]
    ) as EventRow | undefined

    if (!event){
        throw new Error('Event not found')
    }

    if(newImage && event.image){
        const oldImagePath = path.join(
            process.cwd(),
            'uploads',
            'events',
            event.image
        );

        try{
            await fs.unlink(oldImagePath);
        }catch(err: unknown){
            console.error('Failed to delete old image',err);
        }
    }

    if (newImage){
        await dbRun(
            `UPDATE events set image = ? WHERE id = ?`,
            [newImage,eventId]
        );
    }
};