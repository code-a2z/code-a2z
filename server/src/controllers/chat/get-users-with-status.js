/**
 * GET /api/chat/users - List all registered users with online/offline status for chat.
 * Excludes the current authenticated user. Returns limited profile info.
 */

import mongoose from 'mongoose';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { getOnlineUserIds } from '../../stores/online-users.js';

const getUsersWithStatus = async (req, res) => {
  try {
    const { user_id } = req.user;

    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }

    // Build online user set for quick lookup
    const onlineIds = getOnlineUserIds();
    const onlineSet = new Set(onlineIds.map((id) => String(id)));

    // Fetch all users except the current one with limited profile fields
    const users = await USER.find({
      _id: { $ne: new mongoose.Types.ObjectId(String(user_id)) },
    })
      .select('_id personal_info.fullname personal_info.username personal_info.profile_img')
      .lean();

    const data = users.map((u) => ({
      _id: u._id,
      personal_info: {
        fullname: u.personal_info?.fullname ?? '',
        username: u.personal_info?.username ?? '',
        profile_img: u.personal_info?.profile_img ?? '',
      },
      isOnline: onlineSet.has(String(u._id)),
    }));

    return sendResponse(res, 200, 'Users with status fetched successfully', data);
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getUsersWithStatus;

