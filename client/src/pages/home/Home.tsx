import {Link} from 'react-router-dom';
import './Home.css';
import {useCallback, useEffect,useState} from 'react';
import {AiOutlinePlus} from 'react-icons/ai';
import EventCard from '../../components/EventCard/EventCard';
import EditEventModal from '../../components/editModal/EditEventModal';
import type { EventFormData,SocialEvent, Hobby,EventUpdateDTO } from '../../../../shared/types';
import { socket } from '../../socket';

export default function Home(){

    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = currentUser ? currentUser.id : null;

    const [showModal,setShowModal] = useState(false);
    const [step,setStep] = useState(1);
    const [hobbies,setHobbies] = useState<Hobby[]>([]);
    const [location,setLocation] = useState('');
    const [events,setEvents] = useState<SocialEvent[]>([]);
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



    //hobbies from server
    useEffect(() =>{
        fetch('/api/hobbies')
        .then(res => res.json())
        .then(data => {
            console.log("Hobbies from server:", data);
            setHobbies(data);
        })
        .catch(err => console.error('Error loading hobbies', err));
    },[]);

    //socket
    useEffect(() => {

        socket.on('event:created', (newEvent: SocialEvent) => {
            setEvents(prev => [newEvent, ...prev]);
        });

        // Adding this to see all events for debugging
        socket.onAny((eventName, ...args) => {
            console.log(`Пришло событие: "${eventName}"`); // Кавычки покажут пробелы
            console.log('Данные:', args);
        });

        socket.on('event:deleted', (deletedId: number) => {
        // Filtering the deleted event out of the events list
        setEvents(prev => prev.filter(event => event.id !== deletedId));
        });

        socket.on('event:updated', (updatedEvent: SocialEvent) => {
            setEvents(prev => {
                const newEvents = prev.map(event => {
                    if (event.id == updatedEvent.id) {
                        return { ...event, ...updatedEvent };
                    }
                    return event;
                });
                return newEvents;
            });
        });

        return () => {
            socket.off('event:created');
            socket.offAny();
        };
}, []);

    //loading events
    const loadEvents = useCallback(async () => {
        try{
            const params = new URLSearchParams();

            if(location) params.append('location',location);

            const res = await fetch(`/api/events?${params.toString()}`);
            const data = await res.json();

            console.log("🔥 Events from server:", data);

            setEvents(data);
        }catch(err){
            console.error('Error loading events:',err);
        }
    },[location])

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

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

    const eventCreate = async() => {
        try{
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('title',formData.title);
            data.append('description',formData.description);
            data.append('date',formData.date);
            data.append('location',formData.location);
            data.append('isCreatorEvent',String(formData.isCreatorEvent));

            if(formData.eventImage){
                data.append('eventImage',formData.eventImage);
            }

            formData.selectedHobbies.forEach(hobby => data.append('selectedHobbies[]',hobby));


            for (const pair of data.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await fetch ('/api/events/create',{
                method: 'POST',
                headers:{
                    'Authorization' : `Bearer ${token}`
                },
                body: data
            });

            const result = await res.json();
            console.log('Event created',result);

            if(res.ok){
                alert('Event created successfully');
                setShowModal(false);
                setStep(1);
                setFormData({
                    title: '',
                    description: '',
                    selectedHobbies : [],
                    eventImage : null,
                    date : "",
                    location: '',
                    isCreatorEvent : false
                });
            }else{
                alert(result.error || 'Error creating event');
            }
        }catch (err){
            console.error("Error creating event:", err);
            alert("Something went wrong");
        }
    };

    const handleDeleteEvent = async (id : number) => {
        try{
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/delete/${id}`,{
                method : 'DELETE',
                headers: {
                    'Authorization' : `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok){
                console.log('Event deletion requested', id);
            }else{
                alert(data.error || 'Error deleting event');
            }
        }catch (err){
            if (err instanceof Error){
                console.error('Error deleting event:', err.message);
            }else{
                console.error('Unknown error deleting event',err);
            }
        }
    }

    const handleUpdateEvent = async (updatedData: EventUpdateDTO & {id?: number}) => {
        
        const eventId = updatedData.id || editingEvent?.id;
        if(!updatedData) return;

        try{
            const token = localStorage.getItem('token');

            const data = new FormData();
            data.append('title',updatedData.title);
            data.append('description', updatedData.description);
            data.append('date', updatedData.date);
            data.append('location', updatedData.location);

            if (updatedData.eventImage){
                data.append('eventImage', updatedData.eventImage);
            }

            const res = await fetch(`/api/events/update/${updatedData.id}`,{
                method: 'PUT',
                headers: {
                    'Authorization' : `Bearer ${token}`
                },
                body: data
            });

            if(res.ok){
                console.log("✅ Ивент обновлен на сервере");
                setEditingEvent(null); // Closing modal after successful update
            }else{
                const errorData = await res.json();
                alert(`Ошибка: ${errorData.error}`);
                }
            }catch(err){
            console.error('Error updating event:', err);
        }
    }
    
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

                    <button onClick={loadEvents}>Apply Filters</button>
                </div>
                
                {/* Showing the events on a page */}

                <div className="events-list">
                    {events.length === 0 && <p>No events found</p>}
                    {events.map(event => {
                        if (!event) return null;

                        return (
                            <EventCard
                                key = {event.id}
                                event={event}
                                onDelete = {handleDeleteEvent}
                                onEdit ={ (ev: SocialEvent) => setEditingEvent(ev)}
                                currentUserId={currentUserId}
                              
                            />
                        );
                })}
                
                </div>
                {editingEvent && (
                    <EditEventModal 
                        event={editingEvent} 
                        onClose={() => setEditingEvent(null)} 
                        onSave={handleUpdateEvent}
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
                                    {hobbies.map((hobby) =>(
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
                                    <button onClick={eventCreate}>Finish</button>
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