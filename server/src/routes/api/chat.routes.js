import express from 'express';
import authenticateUser from '../../middlewares/auth.middleware.js';
import presence from '../../controllers/chat/presence.js';
import getOnlineUsers from '../../controllers/chat/get-online-users.js';

const chatRoutes = express.Router();

chatRoutes.post('/presence', authenticateUser, presence);
chatRoutes.get('/online-users', authenticateUser, getOnlineUsers);

export default chatRoutes;
