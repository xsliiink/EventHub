import { useEffect, useState,useReducer } from 'react';
import { socket } from '../socket';
import {eventsReducer,initialState} from './events.reducer'
import type { SocialEvent } from '../../../shared/types';

function addPending(prev: Set<number>,id : number) : Set<number>{
    const next = new Set(prev);
    next.add(id);
    return next;
}

function removePending(prev: Set<number>,id : number) : Set<number>{
    const next = new Set(prev);
    next.delete(id);
    return next;
}

function optimisticUpdateEvent(
    prev : SocialEvent[],
    updated: SocialEvent
): SocialEvent[]{
    return prev.map(event =>
        event.id === updated.id ? updated : event
    );
}

function optimisticDeleteEvent(
    prev: SocialEvent[],
    id: number
) : SocialEvent[]{
    return prev.filter(event => event.id !== id)
}

export function useOptimisticEvents(location: string){
    const [state,dispatch] = useReducer(eventsReducer,initialState);
    const {events, pendingIds,isLoading} = state;

     //loading events
    useEffect(() => {
    const loadEvents = async () => {
        dispatch({type: 'LOAD_START'})

        try {

            const params = new URLSearchParams();

            if (location) {
                params.append('location', location);
            }

            const res = await fetch(`/api/events?${params.toString()}`);
            const data = await res.json();

            dispatch({type: 'LOAD_SUCCESS',payload: data});
        } catch (err: unknown) {
        console.error('Error loading events:', err);
        dispatch({type: 'LOAD_SUCCESS',payload: []});
        }
    };

    loadEvents();
    }, [location]);

    //socket
    useEffect(() => {

        const handleCreated = (newEvent : SocialEvent) => {
            dispatch({type:'ADD_EVENT',payload: event});
        }
        
        const handleDeleted = (deletedId : number) => {
              // Filtering the deleted event out of the events list
            dispatch({type: 'DELETE_OPTIMISTIC',payload:id});
        };

        const handleUpdated = (updatedEvent: SocialEvent) =>{
            if (state.pendingIds.has(updated.id)) return;

            dispatch({ type: 'UPDATE_OPTIMISTIC', payload: updated });
        }

        
        socket.on('event:created',handleCreated);
        socket.on('event:deleted',handleDeleted);
        socket.on('event:updated',handleUpdated);

        return () => {
            socket.off('event:created',handleCreated);
            socket.off('event:deleted', handleDeleted);
            socket.off('event:updated', handleUpdated);
        };
    }, [state.pendingIds]);

    const updateEvent = async (updatedData: Partial<SocialEvent> & { id: number }) => {

            const previousEvents = events;
            const eventId = updatedData.id;

             if(eventId) return;

             dispatch({type: 'PENDING_ADD',payload:eventId});

             const current = state.events.find(e => e.id === eventId);

             dispatch({
                type: 'UPDATE_OPTIMISTIC',
                payload: {...current,updatedData},
             })

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
                setEvents(previousEvents);
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
            }
        }catch (err: unknown){
            //rollback
           setEvents(previousEvents);
           console.error('Error deleting element',err)
        }finally{
            //clear pending
            setPendingEventIds(prev => removePending(prev, id));
        }
    }

    return {
        events,
        pendingEventIds,
        isLoading,
        updateEvent,
        deleteEvent,
    }
}