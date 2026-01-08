import React from 'react';
import './EventCard.css';
import type { SocialEvent } from '../../../shared/types'; // Посчитай количество точек, чтобы выйти в корень
 // Посчитай количество точек, чтобы выйти в корень

export default function EventCard({title,description,date,location,hobbies,image}: Partial<SocialEvent>) {
    return(
        <div className="event-card">
            {image && <img src={`/uploads/events/${image}`} alt={title} className='event-image'/>}
            <div className="event-info">
                <h3>{title}</h3>
                <p>{description}</p>
                <p><strong>Date:</strong>{date}</p>
                <p><strong>Location:</strong>{location}</p>
                <p><strong>Hobbies:</strong>{hobbies?.join(', ')}</p>
            </div>
        </div>
    )
}