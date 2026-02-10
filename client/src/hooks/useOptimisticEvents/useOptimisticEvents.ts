import { useEffect, useState,useReducer } from 'react';
import {useQuery} from '@tanstack/react-query';
import { socket } from '../../socket';
import {eventsReducer,initialState} from './events.reducer'
import type { SocialEvent,EventFormData,UpdateEventDTO} from '../../../../shared/types';
import { RiSafariFill } from 'react-icons/ri';

//API functions
async function fetchEvents(location: string): Promise<SocialEvent[]>{
    const params = new URLSearchParams(location ? {location}: {})
    const res = await fetch(`/api/events?${params.toString()}`)
    if(!res.ok) throw new Error('Failed to fetch evetns');
    return res.json();
}

export function useOptimisticEvents(location: string){
    // const [state,dispatch] = useReducer(eventsReducer,initialState);
    // const {events, pendingIds,isLoading} = state;

    const queryClient = useQueryClient();
    const queryKey = ['events',location];

    //Getting the data(server state),loading events
    const {data :events = [],isLoading} = useQuery({
        queryKey,
        queryFn: () => fetchEvents(location);
    })

    //socket
    useEffect(() => {

        const handleCreated = (newEvent : SocialEvent) => {
            queryClient.setQueryData(queryKey,(old: SocialEvent[] = []) => [...old,newEvent]);
        }
         
        const handleDeleted = (deletedId : number) => {
              // Filtering the deleted event out of the events list
            queryClient.setQueryData(queryKey,(old:SocialEvent[] = []) => 
                old.filter(e => e.id !== deletedId)
            );
        };

        const handleUpdated = (updatedEvent: SocialEvent) =>{
            //Manually editing the cash and changing the event
            queryClient.setQueryData(queryKey,(old:SocialEvent[] = []) => 
                old.map(e => e.id === updatedEvent.id ? updatedEvent : e)
            );
        };

        
        socket.on('event:created',handleCreated);
        socket.on('event:deleted',handleDeleted);
        socket.on('event:updated',handleUpdated);

        return () => {
            socket.off('event:created',handleCreated);
            socket.off('event:deleted', handleDeleted);
            socket.off('event:updated', handleUpdated);
        };
    }, [queryClient,queryKey]);

    const updateEvent = async (updatedData: UpdateEventDTO) => {

            const previousEvents = events;
            const eventId = updatedData.id;

             if(!eventId) return;

             dispatch({type: 'PENDING_ADD',payload:eventId});

             const current = state.events.find(e => e.id === eventId);

             const updatedEvent = {
                ...current,
                ...updatedData,
                image: current.image
                    ? `${current.image}?v=${Date.now()}`
                    : current.image,
            };

             dispatch({
                type: 'UPDATE_OPTIMISTIC',
                payload: updatedEvent,
             })

             console.log('FILE:', updatedData.eventImage);

            try{
                const token = localStorage.getItem('token');
                const data = new FormData();

                if (updatedData.title) {
                    data.append('title', updatedData.title);
                }
                if (updatedData.date) {
                    data.append('date', updatedData.date);
                }

                if (updatedData.description !== undefined) {
                    data.append('description', updatedData.description ?? '');
                }

                if (updatedData.location !== undefined) {
                    data.append('location', updatedData.location ?? '');
                }
                if (updatedData.eventImage){
                    data.append('eventImage', updatedData.eventImage);
                }

                const res = await fetch(`/api/events/update/${eventId}`,{
                    method: 'PUT',
                    headers: {
                        'Authorization' : `Bearer ${token}`
                    },
                    body: data
                });

                if(!res.ok){
                    //rollback
                    dispatch({type: 'ROLLBACK',payload: previousEvents});
                }

                const updatedFromServer = await res.json();
                
                dispatch({
                    type: 'UPDATE_OPTIMISTIC',
                    payload: updatedFromServer,
                });
                
                }catch(err){
                    //rollback
                     dispatch({ type: 'ROLLBACK', payload: previousEvents });
            }finally{
                //Clear pending
                 dispatch({ type: 'PENDING_REMOVE', payload: eventId });
            }
    }

    const deleteEvent = async (id : number) => {
        const previousEvents = state.events;

        //mark as pending
        dispatch({type: 'PENDING_ADD',payload: id});

        //optimistic delete
        dispatch({type: 'DELETE_OPTIMISTIC',payload:id})

        try{
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/events/delete/${id}`,{
                method : 'DELETE',
                headers: {
                    'Authorization' : `Bearer ${token}`
                }
            });

            await res.json();

            if (!res.ok){
                //rollback
                dispatch({type:'ROLLBACK',payload: previousEvents});
            }
        }catch (err: unknown){
            //rollback
          dispatch({type:'ROLLBACK',payload: previousEvents});
        }finally{
            //clear pending
            dispatch({type: 'PENDING_REMOVE',payload: id})
        }
    }

    const eventCreate = async(values: EventFormData) => {

        try{
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('title',values.title);
            data.append('description',values.description);
            data.append('date',values.date);
            data.append('location',values.location);
            data.append('isCreatorEvent',String(values.isCreatorEvent));

            if(values.eventImage){
                data.append('eventImage',values.eventImage);
            }

            values.selectedHobbies.forEach(hobby => data.append('selectedHobbies[]',hobby));


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
               dispatch({ type: 'ADD_EVENT', payload: result });
               return {success: true};
            }else{
               return {success: false,error: result.error}
            }
        }catch (err){
            console.error("Error creating event:", err);
            return {success: false}
        }
    };

    return {
        events,
        pendingEventIds: pendingIds,
        isLoading,
        updateEvent,
        deleteEvent,
        eventCreate
    }
}