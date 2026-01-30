import {Router} from 'express';
import {createEvent, getEvents, deleteEvent} from '../controllers/EventController';
import { authenticateToken } from '../middleware/auth.middleware';
import eventUpload from '../middleware/EventUpload';

const router = Router();

router.post('/create',authenticateToken,eventUpload.single('eventImage'),createEvent);

router.get('/',getEvents);

router.delete('/delete/:id',authenticateToken,deleteEvent)

export default router;