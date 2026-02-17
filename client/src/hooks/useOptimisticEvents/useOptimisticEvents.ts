import { useEffect,useMemo } from 'react';
import { useMutation, useQueryClient,useMutationState,useInfiniteQuery, type InfiniteData, } from '@tanstack/react-query';

import { socket } from '../../socket';

import { eventsService } from 'src/api/events.services';
import type { SocialEvent, EventFormData, UpdateEventDTO,PaginatedResponse} from '@shared/types';

import { updateInfiniteData } from '@/utils/rect-query';

interface MutationContext {
    previousData: InfiniteData<PaginatedResponse<SocialEvent>> | undefined;
}

export function useOptimisticEvents(location: string){

    const queryClient = useQueryClient();
    const queryKey = useMemo(() => ['events', location], [location]);

    //Getting the data(server state),loading events
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,

    } = useInfiniteQuery({
        queryKey,
        initialPageParam: 1,
        queryFn: ({pageParam = 1}) =>
             eventsService.getAll({location,page:String(pageParam),limit: '10'}),

        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const events =useMemo(() => 
        data?.pages.flatMap(page => page.data) ?? []

    ,[data]);

    //socket
    useEffect(() => {

        const handleCreated = (newEvent : SocialEvent) => {
            //accessing the cash through queryKey 
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey,(old) => {
                if(!old) return old;
                return{
                    ...old,
                    pages: old.pages.map((page,index) =>
                        //we are only interested in the first page(index 0)
                        index === 0 
                        //adding event to the beginning of the page 1
                        ? {...page,data: [newEvent,...page.data]}
                        //other pages return as they are
                        : page
                    )
                }
            });
        }
         
        const handleDeleted = (deletedId : number) => {
              // Filtering the deleted event out of the events list
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey,(old) => 
                updateInfiniteData(old, (events) =>
                    events.filter(e => e.id !== deletedId)
                )
            );
        };

        const handleUpdated = (updatedEvent: SocialEvent) =>{
            //Manually editing the cash and changing the event
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey,(old) => 
                updateInfiniteData(old,(events) =>
                    events.map(e =>e.id === updatedEvent.id ? updatedEvent : e)
                )
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
            const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey);

            
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey,(old) =>
                updateInfiniteData(old,(events) =>

                    events.map(e => e.id === updatedData.id ? {
                    ...e,
                    ...updatedData,
                    image: e.image ? `${e.image.split('?')[0]}?v=${Date.now()}` : e.image
                } : e)
                )
            );

            return {previousData};
        },
             
        //Error handling
        onError: (err, _ , context) => {

            //overwriting cash with the old data if the error is caught
            if (context?.previousData){
                queryClient.setQueryData(queryKey,context.previousData);
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

            const previousData = queryClient.getQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey);

            //optimistically deleting using helper
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey, (old,) =>
                updateInfiniteData(old,(events) => events.filter(event =>event.id != id )) 
            );

            return { previousData };
        },

        //Rollback on Error
        onError: (err,id,context) => {
            //rollback if server returned an error
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
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
            queryClient.setQueryData<InfiniteData<PaginatedResponse<SocialEvent>>>(queryKey, (old) =>{
                if(!old) return old;

                return{
                    ...old,
                    pages: old.pages.map((page,index) =>
                        index  === 0
                        ? {...page,data: [newlyCreatedEvent,...page.data]}
                        :page
                    ),
                };
            });
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

        fetchNextPage,     
        hasNextPage,        
        isFetchingNextPage,

        pendingEventIds: new Set([...pendingDeleteIds, ...pendingUpdateIds]),
        isCreating: createMutation.isPending,

        //Mutations
        updateEvent: updateMutation.mutateAsync,
        deleteEvent: deleteMutation.mutateAsync,
        eventCreate : createMutation.mutateAsync,
        
    }
}