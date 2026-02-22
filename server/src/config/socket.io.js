import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_ACCESS_KEY } from './env.js';
import { setPresence, removePresence } from '../stores/online-users.js';

/**
 * Initialize Socket.IO server
 * @param {import('http').Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocketIO = httpServer => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      jwt.verify(token, JWT_SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) {
          return next(
            new Error('Authentication error: Invalid or expired token')
          );
        }
        socket.userId = decoded.user_id;
        socket.user = decoded;
        next();
      });
    } catch (error) {
      next(
        new Error(
          `Authentication error: Token verification failed: ${error.message}`
        )
      );
    }
  });

  // Store active socket connections: userId -> socketId
  const activeConnections = new Map();

  io.on('connection', socket => {
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    // Store connection
    activeConnections.set(userId, socket.id);
    setPresence(userId);

    // Join user's personal room for direct messages
    socket.join(`user:${userId}`);

    // Notify user is online
    socket.broadcast.emit('user:online', { userId });

    // Handle sending a message
    socket.on('message:send', async data => {
      try {
        const { receiverId, message } = data;

        if (!receiverId || !message || !message.trim()) {
          socket.emit('message:error', {
            error: 'Receiver ID and message are required',
          });
          return;
        }

        // Import here to avoid circular dependency
        const MESSAGE = (await import('../models/message.model.js')).default;

        // Create message in database
        const newMessage = await MESSAGE.create({
          sender_id: userId,
          receiver_id: receiverId,
          message: message.trim(),
        });

        // Populate sender info
        await newMessage.populate(
          'sender_id',
          'personal_info.fullname personal_info.username personal_info.profile_img'
        );

        // Prepare message data
        const messageData = {
          _id: newMessage._id,
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          message: newMessage.message,
          read: newMessage.read,
          readAt: newMessage.readAt,
          createdAt: newMessage.createdAt,
          updatedAt: newMessage.updatedAt,
        };

        // Send to receiver if online
        const receiverSocketId = activeConnections.get(String(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', messageData);
        }

        // Confirm to sender
        socket.emit('message:sent', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', {
          error: error.message || 'Failed to send message',
        });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', data => {
      const { receiverId } = data;
      if (receiverId) {
        const receiverSocketId = activeConnections.get(String(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:start', {
            senderId: userId,
          });
        }
      }
    });

    socket.on('typing:stop', data => {
      const { receiverId } = data;
      if (receiverId) {
        const receiverSocketId = activeConnections.get(String(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('typing:stop', {
            senderId: userId,
          });
        }
      }
    });

    // Handle marking messages as read
    socket.on('message:read', async data => {
      try {
        const { senderId } = data;

        if (!senderId) {
          socket.emit('message:error', {
            error: 'Sender ID is required',
          });
          return;
        }

        // Import here to avoid circular dependency
        const MESSAGE = (await import('../models/message.model.js')).default;

        // Mark messages as read
        await MESSAGE.updateMany(
          {
            sender_id: senderId,
            receiver_id: userId,
            read: false,
          },
          {
            $set: {
              read: true,
              readAt: new Date(),
            },
          }
        );

        // Notify sender that messages were read
        const senderSocketId = activeConnections.get(String(senderId));
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', {
            receiverId: userId,
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('message:error', {
          error: error.message || 'Failed to mark messages as read',
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      activeConnections.delete(userId);
      removePresence(userId);

      // Notify others that user is offline
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
};
