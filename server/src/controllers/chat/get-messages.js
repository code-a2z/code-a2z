/**
 * GET /api/chat/messages/:userId - Get conversation messages between current user and another user
 */

import mongoose from 'mongoose';
import MESSAGE from '../../models/message.model.js';
import { sendResponse } from '../../utils/response.js';

const getMessages = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { userId: otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }

    if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return sendResponse(res, 400, 'Invalid user ID');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get messages where current user is sender or receiver
    const messages = await MESSAGE.find({
      $or: [
        { sender_id: user_id, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: user_id },
      ],
    })
      .populate(
        'sender_id',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .populate(
        'receiver_id',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    return sendResponse(
      res,
      200,
      'Messages fetched successfully',
      reversedMessages
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getMessages;
