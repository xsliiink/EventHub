import MainLayout from '../../layouts/MainLayout'
import CreateEventModal from '../../features/feed/comonents/CreateEventModal/CreateEventModal';
import FeedSection from '../../features/feed/comonents/FeedSection/FeedSection'

import './Home.css';
import { useEffect, useState} from 'react';

import toast from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

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
        <MainLayout>

            <FeedSection
            events={events}
            isLoading={isLoading}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            pendingEventIds={pendingEventIds}
            currentUserId={currentUserId}
            deleteEvent={deleteEvent}
            updateEvent={updateEvent}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            scrollRef={ref}
            onCreateClick={() => setShowModal(true)}
            />

            <CreateEventModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
            hobbies={hobbies}
            hobbiesLoading={hobbiesLoading}
            isCreating={isCreating}
            onSubmit={handleFinishCreate}
            handleHobbyChange={handleHobbyChange}
            />

        </MainLayout>
        );
}