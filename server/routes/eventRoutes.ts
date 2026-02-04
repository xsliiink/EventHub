import {Router} from 'express';
import {createEvent, getEvents, deleteEvent,updateEvent} from '../controllers/EventController';
import { authenticateToken } from '../middleware/auth.middleware';
import eventUpload from '../middleware/EventUpload';

const router = Router();

router.post(
    '/create',
    authenticateToken,
    eventUpload.single('eventImage'),
    createEvent
);

router.get('/',getEvents);

router.delete(
    '/delete/:id',
    authenticateToken,
    deleteEvent
);

router.put(
    '/update/:id',
    authenticateToken,
    eventUpload.single('eventImage'),
    updateEvent
);

export default router;