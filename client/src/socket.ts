import {io, Socket} from 'socket.io-client';

const URL = 'http://localhost:3007';

export const socket: Socket = io(URL,{
    autoConnect: true,
})