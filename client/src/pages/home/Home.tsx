import {Link} from 'react-router-dom';
import './Home.css';
import { useEffect, useState} from 'react';
import {AiOutlinePlus} from 'react-icons/ai';
import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

import EventCard from '../../components/EventCard/EventCard';
import EditEventModal from '../../components/editModal/EditEventModal';

import { useHobbies } from '../../hooks/useHobbies'
import { useOptimisticEvents } from '../../hooks/useOptimisticEvents';

import type { EventFormData,SocialEvent } from '@shared/types';

const initialFormState: EventFormData = {
    title: '',
    description: '',
    selectedHobbies: [],
    eventImage: null,
    date: "",
    location: '',
    isCreatorEvent: false
};

export default function Home(){
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = currentUser ? currentUser.id : null;
    const [showModal,setShowModal] = useState(false);
    const [step,setStep] = useState(1);
    const [location,setLocation] = useState('');
    const [editingEvent,setEditingEvent] = useState<SocialEvent | null>(null);
    const [formData,setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        selectedHobbies : [],
        eventImage : null,
        date : "",
        location: '',
        isCreatorEvent : false
    });
    

    const {
        events,
        isLoading,
        isError,

        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,

        pendingEventIds,
        isCreating,    
        updateEvent,
        deleteEvent,
        eventCreate
    } = useOptimisticEvents(location);

    const {
        hobbies,
        isLoading : hobbiesLoading,
    } = useHobbies();

    const handleHobbyChange = (hobbyName : string) => {
        setFormData(prev => {
            
            const isSelected = prev.selectedHobbies.includes(hobbyName);//вернет true если хобби пристуствует в нашем массиве или false если нет


            return {
                ...prev,
                selectedHobbies : isSelected
                ? prev.selectedHobbies.filter(c => c!== hobbyName)//попадут только те хобби,что не являются выбранными
                : [...prev.selectedHobbies,hobbyName]//отсавляет старый массив и добавляет новый элемент в конец
            };
        });
    };
    
    const handleFinishCreate = async () =>{

        if (isCreating) return;

        try{
            await eventCreate(formData);

            setShowModal(false);
            setStep(1);
            setFormData(initialFormState);

            toast.success('Event created successfully');
        }catch(err:unknown){
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong';

            console.error('Create error:', errorMessage);
            toast.error(errorMessage)
        }  
    }

    const { ref, inView} = useInView({
        threshold: 0.1
    })

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage){
            fetchNextPage();
        }
    },[inView,hasNextPage,isFetchingNextPage,fetchNextPage])

    return (
        <div className="main-wrapper">

            <div className="header">
                <div className='logo'>
                    <Link to = "/" className='logo-text'>  🚀 MySocialApp</Link>
                </div>
                <nav className='nav'>
                    <Link to= '/' className='nav-link'>Map</Link>
                    <Link to= '/' className='nav-link'>Function2</Link>
                    <Link to= '/' className='nav-link'>Function3</Link>
                </nav>
            </div>


            <div className="container">
                <h2>The Main Page</h2>

                <div className='filters'>
                    <input
                    type="text" 
                    placeholder='Filter by Location'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    />

                    {/* You can add more filters here in the future */}

                </div>
                
                {/* Showing the events on a page */}

                <div className="events-list">
                    {/* Initial loading */}
                    {isLoading && !isFetchingNextPage && <p>Loading events...</p>}

                    {!isLoading && events.length === 0 && (
                        <p>No events found</p>
                    )}

                    {/* error handling */}
                    {isError && (
                        <div className="error-message">
                            <p>Oops! Could not load the events.Try renewing the page</p>
                        </div>
                    )}

                    {!isLoading &&
                        events.map(event => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onDelete={deleteEvent}
                            onEdit={(ev: SocialEvent) => setEditingEvent(ev)}
                            currentUserId={currentUserId}
                            isPending={pendingEventIds.has(event.id)}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {!isLoading && events.length === 0 && <p>No events found</p>}

                {/* Scroll anchor */}
                <div ref={ref} className="scroll-anchor" style={{ height: '40px', textAlign: 'center' }}>
                    {isFetchingNextPage && <p>Loading more events...</p>}
                    {!hasNextPage && events.length > 0 && <p>You've reached the end! 🏁</p>}
                </div>

                {/* Edit event */}
                {editingEvent && (
                    <EditEventModal 
                        event={editingEvent} 
                        onClose={() => setEditingEvent(null)} 
                        onSave={async (data) => {
                            await updateEvent(data);
                            setEditingEvent(null);
                        }}
                    />
                )}
                
                {/* The floating button */}
                <button className='fab' onClick={() => setShowModal(true)}>
                    <AiOutlinePlus size={28} />
                </button>

                {/* Modal Window */}

                {showModal && (
                    <div className='modal-overlay' onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h3>Create an event (Step {step})</h3>

                            {step === 1 && (
                                <div className='step'>
                                    <input 
                                    type="text"
                                    placeholder='Event name'
                                    value={formData.title}
                                    onChange={(e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                                        setFormData({...formData,title: e.target.value})
                                    }
                                    />
                                    <textarea
                                    placeholder='Description'
                                    value={formData.description}
                                    onChange={(e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                        setFormData({...formData,description: e.target.value})
                                    }
                                    />
                                    <button onClick={() => setStep(step + 1)}>Next</button>
                                </div>
                            )}

                            {/* Hobbies- Step2 */}
                        
                            {step === 2 && (
                                <div className='step'>
                                     {hobbiesLoading && <p>Loading hobbies...</p>}

                                    
                                    {!hobbiesLoading && 
                                     hobbies.map((hobby) =>(
                                        <label key={hobby.id}>
                                            <input 
                                            type="checkbox"
                                            checked ={formData.selectedHobbies.includes(hobby.name)}
                                            onChange={() => handleHobbyChange(hobby.name)}
                                            />
                                            {hobby.name}
                                        </label>
                                    ))}
                                    <button onClick={() => setStep(step - 1)}>Back</button>
                                    <button onClick={() => setStep(step + 1)}>Next</button>
                                </div>
                            )}

                            {/* Image upload */}

                            {step === 3 && (
                                <div className='step'>
                                    <input 
                                    type="file" 
                                    onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files ? e.target.files[0] : null;
                                        setFormData({...formData,eventImage: file})
                                    }}
                                    />
                                    <button onClick={() => setStep (step - 1)}>Back</button>
                                    <button onClick={() => setStep (step + 1)}>Next</button>
                                </div>
                            )}

                            {/* Date and time */}

                            {step === 4 && (
                                <div className='step'>
                                    <input 
                                    type="date" 
                                    value={formData.date}
                                    onChange={(e : React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({...formData,date : e.target.value})
                                        }
                                    />
                                    <input 
                                    type="text" 
                                    placeholder='Location'
                                    value={formData.location}
                                    onChange={(e : React.ChangeEvent<HTMLInputElement>) => 
                                        setFormData({...formData,location: e.target.value})
                                        }
                                    />
                                    <button onClick={() => setStep(step - 1)}>Back</button>
                                    <button
                                        onClick={handleFinishCreate}
                                        disabled = {isCreating}
                                        className={`btn-finish ${isCreating ? 'loading' : ''}`}
                                     >
                                        {isCreating ? 'Creating...' : 'Finish'}
                                     </button>
                                </div>
                            )}

                        </div>
                    </div>
                )}


            </div>
            <div className="footer"></div>
        </div>
    )
}