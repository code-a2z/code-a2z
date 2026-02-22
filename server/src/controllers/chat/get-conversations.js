/**
 * GET /api/chat/conversations - Get list of conversations for current user
 */

import mongoose from 'mongoose';
import MESSAGE from '../../models/message.model.js';
import { sendResponse } from '../../utils/response.js';

const getConversations = async (req, res) => {
  try {
    const { user_id } = req.user;

    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }

    // Get distinct conversations (users who have sent or received messages)
    const conversations = await MESSAGE.aggregate([
      {
        $match: {
          $or: [
            { sender_id: new mongoose.Types.ObjectId(user_id) },
            { receiver_id: new mongoose.Types.ObjectId(user_id) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender_id', new mongoose.Types.ObjectId(user_id)] },
              '$receiver_id',
              '$sender_id',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        '$receiver_id',
                        new mongoose.Types.ObjectId(user_id),
                      ],
                    },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: '$user._id',
          personal_info: {
            fullname: '$user.personal_info.fullname',
            username: '$user.personal_info.username',
            profile_img: '$user.personal_info.profile_img',
          },
          lastMessage: {
            _id: '$lastMessage._id',
            message: '$lastMessage.message',
            sender_id: '$lastMessage.sender_id',
            receiver_id: '$lastMessage.receiver_id',
            read: '$lastMessage.read',
            createdAt: '$lastMessage.createdAt',
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    return sendResponse(
      res,
      200,
      'Conversations fetched successfully',
      conversations
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getConversations;
