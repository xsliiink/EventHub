import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useOptimisticEvents } from '@/hooks/useOptimisticEvents/useOptimisticEvents';
import  EventCard  from '../EventCard/EventCard';

export const EventList = ({location} : {location : string}) => {
    const {
        events,
        isLoading,
        isError,

        fetchNextPage,     
        hasNextPage,        
        isFetchingNextPage,

        pendingEventIds,
        isCreating,

        //Mutations
        updateEvent,
        deleteEvent,
        eventCreate,
        
    } = useOptimisticEvents(location);

    const { ref, inView } = useInView();
    
    useEffect(() => {
        if(inView && hasNextPage && !isFetchingNextPage){
            fetchNextPage();
        }
    },[inView,hasNextPage,isFetchingNextPage,fetchNextPage]);

    if(isLoading && !isFetchingNextPage) return <div>Loading...</div>

    return(
        <div className="event-list-container">
            {events.map((event) =>(
                <EventCard 
                    key={event.id} 
                    event={event}
                    isPending={pendingEventIds.has(event.id)}
                    onDelete={() => deleteEvent(event.id)}
                    onEdit={(data) => updateEvent(data)}
                />
            ))}

            {/* {Invisible element at the end of the page} */}
            <div ref ={ref} style={{height: '20px'}}>
                {isFetchingNextPage && <span>Loading more...</span>}
                {!hasNextPage && events.length > 0 && <span>These are all events</span>}
            </div>
        </div>
    )
}