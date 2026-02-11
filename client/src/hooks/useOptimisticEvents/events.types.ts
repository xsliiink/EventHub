import type { SocialEvent } from '@shared/types';

export type EventsState = {
    events: SocialEvent[]; //events from server
    pendingIds : Set<number>, //pending state
    isLoading: boolean //initial loading state
};

//Data that is sent to Reducer so it knows what to do
export type EventsAction = 
| {type: 'LOAD_START'}
| {type: 'LOAD_SUCCESS';payload: SocialEvent[]}
| {type: 'ADD_EVENT';payload: SocialEvent}
| {type: 'UPDATE_OPTIMISTIC',payload: SocialEvent}
| {type: 'DELETE_OPTIMISTIC',payload: number}
| { type: 'ROLLBACK'; payload: SocialEvent[] }
| { type: 'PENDING_ADD'; payload: number }
| { type: 'PENDING_REMOVE'; payload: number };