export interface User {
    id : number;
    username : string;
    password : string;
    bio : string | null;
    avatar: string | null;
}

export interface Hobby{
    id: number;
    name: string;
}

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

export interface UserHobby{
    user_id: number;
    hobby_id : number;
}

export interface EventHobby{
    event_id : number;
    hobby_id : number;
}
