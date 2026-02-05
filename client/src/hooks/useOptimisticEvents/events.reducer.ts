import type { EventsState, EventsAction } from './events.types';

export const initialState: EventsState = {
    events : [],
    pendingIds : new Set(),
    isLoading : true,
};

export function eventsReducer(
    state: eventsState,
    action: EventsAction
) : EventsState {
    switch (action.type){
        case 'LOAD_START':
            return {...state,isLoading: true};

        case 'LOAD_SUCCESS' :
            return{
                ...state,
                isLoading: false,
                events: action.payload,
            };

        case 'ADD_EVENT':
            return{
                ...state,
                events: [action.payload,...state.events],
            };

        case 'UPDATE_OPTIMISTIC':
            return {
                ...state,
                events: state.events.map(event =>
                    event.id === action.payload.id
                        ? action.payload
                        : event
                ),
            };

        case 'DELETE_OPTIMISTIC':
            return {
                ...state,
                events: state.events.filter(
                    event => event.id !== action.payload
                ),
            };

        case 'PENDING_ADD': {
            const next = new Set(state.pendingIds);
            next.add(action.payload);
            return { ...state, pendingIds: next };
        }

        case 'PENDING_REMOVE': {
            const next = new Set(state.pendingIds);
            next.delete(action.payload);
            return { ...state, pendingIds: next };
        }

        case 'ROLLBACK':
            return { ...state, events: action.payload };

        default:
            return state;
    }
}