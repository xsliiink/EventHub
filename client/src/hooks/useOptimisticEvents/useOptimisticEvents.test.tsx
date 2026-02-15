import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticEvents } from './useOptimisticEvents';
import type { SocialEvent } from '../../../../shared/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

global.fetch = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

interface WrappedProps {
    children: ReactNode;
}

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



//creating the provider for the tests
const createWrapper = () => {
    const queryClient : QueryClient= new QueryClient({
        defaultOptions: {
            queries: {retry: false}
        },
    });

    return function TestWrapper({children} : WrappedProps) : JSX.Element {
        return(
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }
};

describe('UseOptimisticEvents', () => {
    it('optimistically updates event and reconciles with server response', async () => {
        let currentEvent = { ...mockEvent };

        (global.fetch as jest.Mock).mockImplementation(
            async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = typeof input === 'string' ? input : input.toString();

            // UPDATE
            if (url.includes('/update/') && init?.method === 'PUT') {
                currentEvent = { ...currentEvent, title: 'Server title' };

                return {
                ok: true,
                status: 200,
                json: async () => currentEvent,
                };
            }

            // GET ALL
            if (url.includes('/api/events')) {
                return {
                ok: true,
                status: 200,
                json: async () => ({
                    data: [currentEvent],
                    nextPage: null,
                }),
                };
            }

            return {
                ok: false,
                status: 404,
                json: async () => ({}),
            };
            }
        );

        const { result } = renderHook(() => useOptimisticEvents(''), {
            wrapper: createWrapper(),
        });

        // Ждём первичную загрузку
        await waitFor(() => {
            expect(result.current.events.length).toBe(1);
        });

        // Запускаем update
        await act(async () => {
            await result.current.updateEvent({
            id: 1,
            title: 'Optimistic title',
            });
        });

        // ✅ ЖДЁМ финальное состояние после invalidate + refetch
        await waitFor(() => {
            expect(result.current.events[0].title).toBe('Server title');
        });
    });

    it('adds and removes event id from pendingIds during update', async () => {
        let currentEvent = { ...mockEvent };

        (global.fetch as jest.Mock).mockImplementation(
            async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = typeof input === 'string' ? input : input.toString();

            // UPDATE
            if (url.includes('/update/') && init?.method === 'PUT') {
                // небольшая задержка, чтобы pending точно стал true
                await new Promise(res => setTimeout(res, 50));

                currentEvent = { ...currentEvent, title: 'Updated' };

                return {
                ok: true,
                status: 200,
                json: async () => currentEvent,
                };
            }

            // GET ALL
            return {
                ok: true,
                status: 200,
                json: async () => ({
                data: [currentEvent],
                nextPage: null,
                }),
            };
            }
        );

        const { result } = renderHook(() => useOptimisticEvents(''), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.events.length).toBe(1);
        });

        act(() => {
            result.current.updateEvent({ id: 1, title: 'Updated' });
        });

        // ✅ ждём pending = true
        await waitFor(() => {
            expect(result.current.pendingEventIds.has(1)).toBe(true);
        });

        // ✅ ждём pending = false
        await waitFor(() => {
            expect(result.current.pendingEventIds.has(1)).toBe(false);
        });
    });

    it('rolls back state if update request fails', async() => {
        
         const mockPaginatedResponse = {
            data: [mockEvent],
            nextPage: null
        };
        
        //response from the server
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ok:true,json: async() => mockPaginatedResponse})
            //error updating
            .mockResolvedValueOnce({ok:false, json: async () => ({ error: 'fail' })});

        const { result } =renderHook(() => useOptimisticEvents(''),{
            wrapper: createWrapper()
        });

        await waitFor(() => {
            expect(result.current.events.length).toBe(1);
        })

        await act(async() =>{
            try{
                await result.current.updateEvent({
                id : 1,
                title: 'Broken Update'
            });
            }   catch(e){

            }     
        });

        expect(result.current.events[0].title).toBe('Old title');

        //Is pendingIds clean?
        expect(result.current.pendingEventIds.has(1)).toBe(false);
        
    })
})