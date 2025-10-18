import {Link} from 'react-router-dom';
import './Home.css';
import {useEffect,useState} from 'react';
import {AiOutlinePlus} from 'react-icons/ai';
import EventCard from '../../components/EventCard';


export default function Home(){
    const [showModal,setShowModal] = useState(false);
    const [step,setStep] = useState(1);
    const [hobbies,setHobbies] = useState([]);
    const [formData,setFormData] = useState({
        name: '',
        description: '',
        selectedHobbies : [],
        eventImage : null,
        date : "",
        location: '',
        isCreatorEvent : false
    });

    const [location,setLocation] = useState('Dundalk');
    const [selectedHobbies,setSelectedHobbies] = useState([]);
    const [officialOnly,setOfficialOnly] = useState(false);
    const [events,setEvents] = useState([]);
    const [allHobbies,setAllHobbies] = useState([]);

    useEffect(() => {
        fetch('/api/hobbies')
        .then(res => res.json())
        .then((data => setAllHobbies(data)));
    },[]);

    useEffect(() =>{
        fetch('http://localhost:3007/api/hobbies')
        .then(res => res.json())
        .then(data => {
            console.log("Hobbies from server:", data);
            setHobbies(data);
        })
        .catch(err => console.error('Error loading hobbies', err));
    },[]);

    useEffect(() => {
        loadEvents(); // подгрузим события при первом рендере
    }, []);

    console.log("Current hobbies state:", hobbies);

    const next = () => setStep(step + 1);
    const prev = () => setStep(step - 1);

    const handleHobbyChange = (hobbyName) => {
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
            const data = new FormData();
            data.append('name',formData.name);
            data.append('description',formData.description);
            data.append('date',formData.date);
            data.append('location',formData.location);
            data.append('isCreatorEvent',formData.isCreatorEvent);

            if(formData.eventImage){
                data.append('eventImage',formData.eventImage);
            }

            formData.selectedHobbies.forEach(hobby => data.append('selectedHobbies[]',hobby));


             for (let pair of data.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await fetch ('/api/events',{
                method: 'POST',
                body: data
            });

            const result = await res.json();
            console.log('Event created',result);

            if(res.ok){
                alert('Event created successfully');
                setShowModal(false);
                setStep(1);
                setFormData({
                    name: '',
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

    const loadEvents = async () => {
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
    }

    return (
        <div className="main-wrapper">

            <div className="header">
                <div className='logo'>
                    <Link to = "/" className='logo-text'>  🚀 MySocialApp</Link>
                </div>
                <nav className='nav'>
                    <Link className='nav-link'>Map</Link>
                    <Link className='nav-link'>Function2</Link>
                    <Link className='nav-link'>Function3</Link>
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

                     {/* <select 
                        value={selectedHobbies}
                        onChange={(e) => setSelectedHobbies(e.target.value)}
                     >
                        <option value="">AllHobbies</option>
                        {allHobbies.map(h => (
                            <option key = {h.id} value={h.name}>{h.name}</option>
                        ))}
                     </select>

                     <label >
                        <input
                         type="checkbox"
                         checked = {officialOnly}
                         onChange={() => setOfficialOnly(!officialOnly)} 
                         />
                         Official Only
                     </label> */}

                     <button onClick={loadEvents}>Apply Filters</button>
                </div>
                
                {/* Showing the events on a page */}

                <div className="events-list">
                    {events.length === 0 && <p>No events found</p>}
                    {events.map(event => 
                        <EventCard
                         key={event.id}
                        title = {event.name}//
                        description = {event.description}//
                        date = {event.date}//
                        location = {event.location}//
                        hobbies = {event.hobbies}
                        image = {event.image}
                         />
                    )}
                </div>
                
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
                                    value={formData.name}
                                    onChange={(e) => 
                                        setFormData({...formData,name: e.target.value})
                                    }
                                    />
                                    <textarea
                                    placeholder='Description'
                                    value={formData.description}
                                    onChange={(e) =>
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
                                    onChange={(e) => setFormData({...formData,eventImage: e.target.files[0]})}
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
                                    onChange={(e) => setFormData({...formData,date : e.target.value})}
                                    />
                                    <input 
                                    type="text" 
                                    placeholder='Location'
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData,location: e.target.value})}
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