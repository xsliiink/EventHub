import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import "./db";
import path from 'path';
import hobbyRoutes from './routes/hobbyRoutes';
import EventRoutes from './routes/eventRoutes';
import AuthRoutes from './routes/AuthRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const eventsPath = path.join(process.cwd(), 'uploads', 'events');
app.use('/uploads/events', express.static(eventsPath));


app.use('/api/auth',AuthRoutes);
app.use('/api/events',EventRoutes);
app.use('/api/hobbies',hobbyRoutes);

export default app;
