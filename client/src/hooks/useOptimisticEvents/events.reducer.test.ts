import { eventsReducer, initialState } from './events.reducer';
import type { EventsState } from './events.types';
import type { SocialEvent } from '../../../../shared/types';

const mockEvent :SocialEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Description',
    date: '2026-01-01',
    location: 'Berlin',
    image: 'image.jpg',
    hobbies: [],
    creator_id : 123,
    official : 0
}

describe('eventsReducer', () => {
    it('should let isLoading to true on LOAD_START', () =>{
        const state: EventsState = {
            ...initialState,
            isLoading: false
        }

        const action = {type: 'LOAD_START' as const};

        const nextState = eventsReducer(state,action);

        expect(nextState.isLoading).toBe(true);
    })

    it('should load events on LOAD_SUCCESS', () => {
        const state: EventsState = {
            ...initialState,
            isLoading: true,
        }

        const action = {
            type: 'LOAD_SUCCESS' as const,
            payload: [mockEvent],
        };

        const nextState = eventsReducer(state,action);

        expect(nextState.isLoading).toBe(false);
        expect(nextState.events).toHaveLength(1);
        expect(nextState.events[0].id).toBe(mockEvent.id)
    })

    it('should update an event on UPDATE_OPTIMISTIC', () =>{
        const state: EventsState = {
            events: [mockEvent],
            pendingIds: new Set(),
            isLoading: false,
        }

        const updatedEvent = {
            ...mockEvent,
            title: 'Updated title',
        };

        const action = {
            type: 'UPDATE_OPTIMISTIC' as const,
            payload: updatedEvent
        }

        const nextState = eventsReducer(state,action);

        expect(nextState.events[0].title).toBe('Updated title');
    })

    it('should add event id to pendingIds', () => {
        const state: EventsState = {
            events: [],
            pendingIds: new Set(),
            isLoading: false,
        };

        const action = {
            type: 'PENDING_ADD' as const,
            payload: 1,
        };

        const nextState = eventsReducer(state,action);

        expect(nextState.pendingIds.has(1)).toBe(true);
    })

    it('should rollback events state', () => {
        const previousEvents = [mockEvent];

        const state: EventsState = {
            events: [],
            pendingIds: new Set([1]),
            isLoading : false
        };

        const action = {
            type: 'ROLLBACK' as const,
            payload: previousEvents
        }

        const nextState = eventsReducer(state,action);

        expect(nextState.events).toEqual(previousEvents)
    })
})