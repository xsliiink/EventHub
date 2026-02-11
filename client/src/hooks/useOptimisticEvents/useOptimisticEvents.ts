import { useEffect,useMemo } from 'react';
import { useQuery, useMutation, useQueryClient,useMutationState } from '@tanstack/react-query';
import { socket } from '../../socket';
import { eventsService } from 'src/api/events.services';
import type { SocialEvent,EventFormData,UpdateEventDTO} from '@shared/types';

interface MutationContext {
    previousEvents: SocialEvent[] | undefined;
}

export function useOptimisticEvents(location: string){

    const queryClient = useQueryClient();
    const queryKey = useMemo(() => ['events', location], [location]);

    //Getting the data(server state),loading events
    const {data :events = [], isLoading, isError} = useQuery({
        queryKey,
        queryFn: () => eventsService.getAll(location)
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
    }, [queryClient,location,queryKey]);

    const updateMutation = useMutation<SocialEvent,Error,UpdateEventDTO,MutationContext>({
        mutationKey: ['updateEvent'],

        //instead of try/catch block
        mutationFn: eventsService.update,

        //Optimistic update
        onMutate: async(updatedData) => {

            //if there is an ongoing loading - cancel to prevent overlaps
            await queryClient.cancelQueries({ queryKey });

            //saving the current state
            const previousEvents = queryClient.getQueryData<SocialEvent[]>(queryKey);

            
            queryClient.setQueryData(queryKey,(old: SocialEvent[] = []) =>
                old.map(e => e.id === updatedData.id ? {
                    ...e,
                    ...updatedData,
                    image: e.image ? `${e.image.split('?')[0]}?v=${Date.now()}` : e.image
                } : e)
            );

            return {previousEvents};
        },
             
        //Error handling
        onError: (err, _ , context) => {

            //overwriting cash with the old data if the error is caught
            if (context?.previousEvents){
                queryClient.setQueryData(queryKey,context.previousEvents);
            }
            console.error('Error updating',err);
        },

        onSettled: () => {
            //synch with the database
            queryClient.invalidateQueries({ queryKey });
        }
                
    })

    const deleteMutation = useMutation<void,Error,number,MutationContext>({
        mutationKey: ['deleteEvent'],
        mutationFn: eventsService.delete,

        //Optimistic Deletion
        onMutate: async (id:number): Promise<MutationContext> => {

             //if there is an ongoing loading - cancel to prevent overlaps
            await queryClient.cancelQueries({ queryKey });

            const previousEvents = queryClient.getQueryData<SocialEvent[]>(queryKey);

            queryClient.setQueryData<SocialEvent[]>(queryKey, (old = []) => 
                old.filter(event => event.id !== id)
            );

            return { previousEvents };
        },

        //Rollback on Error
        onError: (err,id,context) => {
            //rollback if server returned an error
            if (context?.previousEvents) {
                queryClient.setQueryData(queryKey, context.previousEvents);
            }
            console.error(`Error deleting event ${id}:`, err.message);
        },

        onSettled: () => {
            //synching with sever
            queryClient.invalidateQueries({ queryKey });
        }
    })
        
    const createMutation = useMutation<SocialEvent,Error,EventFormData>({
        mutationFn: eventsService.create,

        onSuccess: (newlyCreatedEvent) => {
            queryClient.setQueryData<SocialEvent[]>(queryKey, (old = []) => [
            newlyCreatedEvent, 
            ...old
            ]);
        },
        
        onSettled: () => {
            queryClient.invalidateQueries({queryKey});
        }
    })

    //Getting the id's of the pending events 
    const pendingDeleteIds = useMutationState({
        filters: { mutationKey: ['deleteEvent'], status: 'pending' },
        select: (mutation) => mutation.state.variables as number,
    });

    const pendingUpdateIds = useMutationState({
        filters: { mutationKey: ['updateEvent'], status: 'pending' },
        select: (mutation) => (mutation.state.variables as UpdateEventDTO).id,
    });

    return {
        events: events ?? [],
        isLoading,
        isError,

        pendingEventIds: new Set([...pendingDeleteIds, ...pendingUpdateIds]),
        isCreating: createMutation.isPending,

        //Mutations
        updateEvent: updateMutation.mutate,
        deleteEvent: deleteMutation.mutate,
        eventCreate : createMutation.mutateAsync,
        
    }
}