import {EventRow, SocialEvent} from '@shared/types';

export function mapEventRowToSocialEvent(row: EventRow) : SocialEvent {
    return{
        id : row.id,
        title: row.name,
        description: row.description,
        date: row.date,
        location: row.location,
        image: row.image,
        creator_id: row.creator_id,
        official: row.official,
        hobbies: row.hobbies
        ? Array.isArray(row.hobbies)
            ? row.hobbies
            : row.hobbies.split(',')
        : []
    }
}