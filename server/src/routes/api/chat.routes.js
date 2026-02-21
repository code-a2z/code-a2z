import express from 'express';
import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import presence from '../../controllers/chat/presence.js';
import getOnlineUsers from '../../controllers/chat/get-online-users.js';
import getUsersWithStatus from '../../controllers/chat/get-users-with-status.js';
import getMessages from '../../controllers/chat/get-messages.js';
import getConversations from '../../controllers/chat/get-conversations.js';

const chatRoutes = express.Router();

const chatsRead = requirePermission('chats', 'read');
const chatsWrite = requirePermission('chats', 'write');

chatRoutes.post(
  '/presence',
  authenticateUser,
  requireOrgScope,
  chatsWrite,
  presence
);
chatRoutes.get(
  '/online-users',
  authenticateUser,
  requireOrgScope,
  chatsRead,
  getOnlineUsers
);
chatRoutes.get(
  '/users',
  authenticateUser,
  requireOrgScope,
  chatsRead,
  getUsersWithStatus
);
chatRoutes.get(
  '/conversations',
  authenticateUser,
  requireOrgScope,
  chatsRead,
  getConversations
);
chatRoutes.get(
  '/messages/:userId',
  authenticateUser,
  requireOrgScope,
  chatsRead,
  getMessages
);

export default chatRoutes;
