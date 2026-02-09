import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticEvents } from './useOptimisticEvents';
import type { SocialEvent } from '../../../../shared/types';

global.fetch = jest.fn();

const mockEvent: SocialEvent = {
    id : 1,
    title: 'Old title',
    description: 'Desc',
    date: '2026-01-01',
    location: 'Berlin',
    image: 'image.jpg',
    hobbies: [],
    creator_id: 1,
    official: 0,
}

describe('UseOptimisticEvents', () => {
    it('optimistically updates event and reconciles with serve response', async () =>{
        const updatedFromServer = {
            ...mockEvent,
            title: 'Server title',
        };

        (global.fetch as jest.Mock)
        //getting events from useEffect
        .mockResolvedValueOnce({ok: true,json: async() => [mockEvent]})
        //Server response for the update
        .mockResolvedValueOnce({ ok: true,json: async() => updatedFromServer});

        const {result} = renderHook(() => useOptimisticEvents(''));

        //waiting until the first loading is finished
        await waitFor(() => {
            expect(result.current.events.length).toBe(1);
        });

        await act(async () => {
            await result.current.updateEvent({ id: 1, title: 'Optimistic title' });
         });

        expect(result.current.events[0].title).toBe('Server title');
    })

    it('adds and removes event id from pendingIds during update', async () => {
        (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ok:true,json: async() => [mockEvent]})
        .mockResolvedValueOnce({ok: true,json: async() => mockEvent,});
            

        //calling a hook,getting data from server
        const { result } = renderHook(() => useOptimisticEvents(''));

            //waiting for the first load of the list
            await waitFor(() => expect(result.current.events.length).toBe(1));

            //checking if pending events is still empty
            expect(result.current.pendingEventIds.has(1)).toBe(false);

        //updating event
         let promise : Promise<void>;
         act(() =>{
            promise = result.current.updateEvent({id:1, title: 'Updated'})
         })

            //checking if pending events now has a new event in it
            expect(result.current.pendingEventIds.has(1)).toBe(true);

        //Waiting till the event is updated
        await act(async () =>{
                await promise;
            })

            //have we deleted the event from pending?
        expect(result.current.pendingEventIds.has(1)).toBe(false);

    })

    it('rolls back state if update request fails', async() => {
        //response from the server
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ok:true,json: async() => [mockEvent] })
            //error updating
            .mockResolvedValueOnce({ok:false, json: async () => ({ error: 'fail' })});

        const { result } =renderHook(() => useOptimisticEvents(''));

        await waitFor(() => {
            expect(result.current.events.length).toBe(1);
        })

        await act(async() =>{
            await result.current.updateEvent({
                id : 1,
                title: 'Broken Update'
            });
        });

        expect(result.current.events[0].title).toBe('Old title');

        //Is pendingIds clean?
        expect(result.current.pendingEventIds.has(1)).toBe(false);
        
    })
})