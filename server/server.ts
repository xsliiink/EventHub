import app from './app';
import http from 'http';
import {Server,Socket} from 'socket.io';


const port = 3007;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET','POST']
    }
})

app.set('io', io);

io.on('connection',(socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(port,() => {
    console.log(`Server is running on port ${port}`);
})

