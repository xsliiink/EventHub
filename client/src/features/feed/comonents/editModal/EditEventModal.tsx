import React,{useState} from 'react';
import type { SocialEvent } from '@shared/types';
import type { UpdateEventDTO } from '@shared/types';
import './EditEventModal.css';

interface EditEventModalProps {
    event: SocialEvent;
    onClose: () => void;
    onSave: (updatedData: UpdateEventDTO) => Promise<void>;
}

export default function EditEventModal({
    event,
    onClose,
    onSave
}: EditEventModalProps) {   

    const [formData,setFormData] = useState<UpdateEventDTO>({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        eventImage: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await onSave(formData)
    };

    return(
        <div className="modal-overlay" onClick = {onClose}>
            <div className="modal-content" onClick ={e => e.stopPropagation()}>
                <h3>Edit Event</h3>

                <form onSubmit={handleSubmit} className='modal-form'>
                    {/* Title */}
                    <div className="form-group">
                        <input
                            value={formData.title}
                            onChange = {e => setFormData({...formData, title: e.target.value})}
                            placeholder="Title" 
                        />
                    </div>
                    

                    {/* Description */}
                    <div className="form-group">
                        <textarea
                            value={formData.description ?? ''}
                            onChange = {e => setFormData({...formData, description: e.target.value})}
                            placeholder="Description" 
                        />
                    </div>
                    

                    {/* Date and Location*/}
                    <div className="form-row">
                        <input
                            type="date"
                            value = {formData.date ?? ''}
                            onChange = {e =>
                                setFormData({...formData,date: e.target.value})
                            } 
                         />

                    <input
                        type="text"
                        value = {formData.location ?? ''}
                        onChange = {e =>
                            setFormData({...formData,location: e.target.value})
                        }
                        placeholder ='Location'
                      />
                    </div>

                    {/* Image */}
                    <div className="form-group">
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
                    </div>

                     <div className="modal-actions">
                        <button type ='submit' className='btn-save'>Save</button>
                        <button type ='button' onClick={onClose} className='btn-cancel'>Cancel</button>
                     </div>
                </form>
            </div>
        </div>
    )
}