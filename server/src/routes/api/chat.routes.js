import express from 'express';
import authenticateUser from '../../middlewares/auth.middleware.js';
import presence from '../../controllers/chat/presence.js';
import getOnlineUsers from '../../controllers/chat/get-online-users.js';
import getMessages from '../../controllers/chat/get-messages.js';
import getConversations from '../../controllers/chat/get-conversations.js';

const chatRoutes = express.Router();

chatRoutes.post('/presence', authenticateUser, presence);
chatRoutes.get('/online-users', authenticateUser, getOnlineUsers);
chatRoutes.get('/conversations', authenticateUser, getConversations);
chatRoutes.get('/messages/:userId', authenticateUser, getMessages);

export default chatRoutes;
