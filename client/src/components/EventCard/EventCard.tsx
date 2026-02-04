import './EventCard.css';
import type { SocialEvent } from '../../../shared/types';

interface EventCardProps{
    event: SocialEvent;
    currentUserId?: number;
    onDelete?: (eventId: number) => void;
    onEdit?: (event: SocialEvent) => void;
}

export default function EventCard({event,currentUserId,onDelete,onEdit}: EventCardProps) {
    
    const { id, title, description, date, location, hobbies, image, creator_id } = event;

    const isOwner = currentUserId === creator_id;

    return(
        <div className="event-card">
            {image && (
                 <img 
                    src={`/uploads/events/${image}`} 
                    alt={title} 
                    className='event-image'
                />
            )}
            <div className="event-info">
                <h3>{title}</h3>
                <p>{description}</p>
                <p><strong>Date:</strong>{date}</p>
                <p><strong>Location:</strong>{location}</p>
                
                {hobbies && hobbies.length > 0 && (
                    <p><strong>Hobbies:</strong> {hobbies.join(', ')}</p>
                )}

                {isOwner && (
                   <div className="event-actions">
                      <button
                        className="action-btn edit-button"
                        onClick={() =>  {
                            console.log("Кнопка нажата, ивент:", event.id);
                            onEdit(event);
                            }}>
                            Edit
                        </button>
                        
                       <button
                        className = 'action-btn delete-button'
                        onClick={() => {
                            if(window.confirm('Are you sure you want to delete this event?')){
                                onDelete(id);
                            }
                        }}
                    >
                        Delete
                    </button>  
                   </div>
                )}
            </div>
        </div>
    )
}