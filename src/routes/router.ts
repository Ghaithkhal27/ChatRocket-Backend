import express from 'express';
import { signup, login } from '../auth/auth';
import { getMessages, getMessagesBySender,  } from '../controller/messages';
import { getAllUsers } from '../controller/users';
import { createRoom } from '../controller/room';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/messages/:senderId/:receiverId', getMessages)
router.get('/messages/:senderId', getMessagesBySender);
router.get('/users', getAllUsers);
router.post('/room/:id', createRoom);



export default router;
