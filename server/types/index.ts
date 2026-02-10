import {Request} from 'express';

//creating interface for user JWT data
export interface TokenPayload {
    id: number;
    username: string;
}

//extending express Request interface to include user property
export interface AuthRequest extends Request {
    user? : TokenPayload
}

export interface JwtPayload {
    id : number;
    username : string;
}