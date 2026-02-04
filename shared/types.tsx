export interface User {
    id : number;
    username : string;
    password : string;
    bio : string | null;
    avatar: string | null;
}

//Hobby as sent to client
export interface Hobby{
    id: number;
    name: string;
}

//Event as sent to client
export interface SocialEvent{
    id: number;
    title: string;
    hobbies: string[];
    description: string | null;
    creator_id : number;
    official: number;
    date: string;
    image: string | null;
    location: string | null;
}
//Raw Event data from DB
export interface EventRow extends Omit<SocialEvent,'hobbies'|'title'>{
    name: string;
    hobbies: string | null;
}

export interface UserHobby{
    user_id: number;
    hobby_id : number;
}

export interface EventHobby{
    event_id : number;
    hobby_id : number;
}

export interface hobbyRow{
    id: number;
    name: string;
}

export interface EventBody{
    name: string;
    description: string;
    location: string;
    date: string;
    'selectedHobbies[]'?: string | string[];
}

export interface EventsQuery{
    location?: string;
    hobby?: string;
    official?: string;
}

export interface RegisterBody{
    username: string;
    password: string;
    bio: string;
    hobbies: string;
}

export interface LoginBody{
    username?: string;
    password?: string;
}

export interface userRow{
    id: number;
    username: string;
    password: string;
    bio?: string;
    avatar?: string;
}

export interface rawHobbies{
    [key: string]: string | string[];
}

// Form data for creating/editing an event on the client side
export interface EventFormData{
    name: string;
    description: string;
    selectedHobbies : string[];
    eventImage : File | null;
    date : string;
    location: string;
    isCreatorEvent : boolean;
}
