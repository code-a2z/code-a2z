import express from 'express';
import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';
import presence from '../../controllers/chat/presence.js';
import getOnlineUsers from '../../controllers/chat/get-online-users.js';
import getUsersWithStatus from '../../controllers/chat/get-users-with-status.js';
import getMessages from '../../controllers/chat/get-messages.js';
import getConversations from '../../controllers/chat/get-conversations.js';

const chatRoutes = express.Router();

chatRoutes.post('/presence', authenticateUser, requireOrgScope, presence);
chatRoutes.get(
  '/online-users',
  authenticateUser,
  requireOrgScope,
  getOnlineUsers
);
chatRoutes.get('/users', authenticateUser, requireOrgScope, getUsersWithStatus);
chatRoutes.get(
  '/conversations',
  authenticateUser,
  requireOrgScope,
  getConversations
);
chatRoutes.get(
  '/messages/:userId',
  authenticateUser,
  requireOrgScope,
  getMessages
);

export default chatRoutes;
