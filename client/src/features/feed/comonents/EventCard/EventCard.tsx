import './EventCard.css';
import type { SocialEvent } from '@shared/types';

interface EventCardProps{
    event: SocialEvent;
    currentUserId?: number;
    isPending : boolean;
    onDelete?: (eventId: number) => void;
    onEdit?: (event: SocialEvent) => void;
}

export default function EventCard({event,currentUserId,isPending,onDelete,onEdit}: EventCardProps) {
    
    const { id, title, description, date, location, hobbies, image, creator_id } = event;

    const isOwner = currentUserId === creator_id;

    return(
        <div className="event-card">
            {/* Event Image */}
            <div className="image-wrapper">
                {image && (
                    <img 
                        src={`/uploads/events/${image}`} 
                        alt={title} 
                        className='event-image'
                    />
                )}
            </div>

            <div className="event-info">
                
                <div className="event-text-content">
                    <h3>{title}</h3>
                    <p className='event-description'>{description}</p>
                    <div className="event-meta">
                        <p><strong>Date:</strong>📅 {date}</p>
                        <p><strong>Location:</strong>📍 {location}</p>
                    </div>
                </div>
                
                
                {hobbies && hobbies.length > 0 && (
                    <p><strong>Hobbies:</strong> {hobbies.join(', ')}</p>
                )}

                {isOwner && (
                   <div className="event-actions">
                    {/* Edit button */}
                      <button
                        disabled = {isPending}
                        className="action-btn edit-button"
                        onClick={() =>  {
                            console.log("Кнопка нажата, ивент:", event.id);
                            onEdit?.(event);
                            }}>
                            Edit
                        </button>
                        
                       <button
                        disabled = {isPending}
                        className = 'action-btn delete-button'
                        onClick={() => {
                            if(window.confirm('Are you sure you want to delete this event?')){
                                onDelete?.(id);
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