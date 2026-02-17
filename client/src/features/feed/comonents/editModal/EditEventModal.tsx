import React,{useState} from 'react';
import { SocialEvent } from '@shared/types';
import type { EventUpdateDTO } from '../../../../../../server/validation/event';
import './EditEventModal.css';

interface EditEventModalProps {
    event: SocialEvent;
    onClose: () => void;
    onSave: (updatedData: SocialEvent) => Promise<void>;
}

export default function EditEventModal({
    event,
    onClose,
    onSave
}: EditEventModalProps) {   

    const [formData,setFormData] = useState<EventUpdateDTO>({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        eventImage: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await onSave({
           ...formData,
            id: event.id
        });
    };

    return(
        <div className="modal-overlay" onClick = {onClose}>
            <div className="modal-content" onClick ={e => e.stopPropagation()}>
                <h3>Edit Event</h3>

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <input
                     value={formData.title}
                     onChange = {e => setFormData({...formData, title: e.target.value})}
                     placeholder="Title" 
                     />

                    {/* Description */}
                    <textarea
                        value={formData.description}
                         onChange = {e => setFormData({...formData, description: e.target.value})}
                         placeholder="Description" 
                     />

                    {/* Date */}

                    <input
                     type="date"
                     value = {formData.date ?? ''}
                     onChange = {e =>
                        setFormData({...formData,date: e.target.value})
                     } 
                     />

                    {/* Location */}
                    <input
                     type="text"
                     value = {formData.location ?? ''}
                     onChange = {e =>
                        setFormData({...formData,location: e.target.value})
                     }
                     placeholder ='Location'
                      />

                    {/* Image */}
                    <input
                     type="file"
                     accept="image/*"
                     onChange={e =>
                        setFormData({
                            ...formData,
                            eventImage: e.target.files?.[0] ?? null
                            })
                        }
                     />

                     <div className="modal-actions">
                        <button type ='submit'>Save</button>
                        <button type ='button' onClick={onClose}>Cancel</button>
                     </div>
                </form>
            </div>
        </div>
    )
}