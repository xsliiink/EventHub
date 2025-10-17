import React from 'react';
import './EventCard.css';

interface EventCardPops {
    title : string,
    description: string,
    date: string,
    location: string,
    hobbies?: string[],
    image? : string,
}

export default function EventCard({title,description,date,location,hobbies,image}: EventCardPops) {
    return(
        <div className="event-card">
            {image && <img src={`/uploads/events/${image}`} alt='{title}' className='event-image'/>}
            <div className="event-info">
                <h3>{title}</h3>
                <p>{description}</p>
                <p><strong>Date:</strong>{date}</p>
                <p><strong>Location:</strong>{location}</p>
                <p><strong>Hobbies:</strong>{hobbies.join(', ')}</p>
            </div>
        </div>
    )
}