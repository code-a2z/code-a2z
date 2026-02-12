/**
 * GET /api/chat/online-users - List users currently online (for chat)
 * Excludes the current user. Returns limited profile for display.
 */

import mongoose from 'mongoose';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { getOnlineUserIds } from '../../stores/online-users.js';

const getOnlineUsers = async (req, res) => {
  try {
    const { user_id } = req.user;
    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }

    const onlineIds = getOnlineUserIds().filter((id) => String(id) !== String(user_id));
    if (onlineIds.length === 0) {
      return sendResponse(res, 200, 'Online users fetched successfully', []);
    }

    const objectIds = onlineIds.map((id) => new mongoose.Types.ObjectId(id));
    const users = await USER.find({ _id: { $in: objectIds } })
      .select('_id personal_info.fullname personal_info.username personal_info.profile_img')
      .lean();

    const data = users.map((u) => ({
      _id: u._id,
      personal_info: {
        fullname: u.personal_info?.fullname ?? '',
        username: u.personal_info?.username ?? '',
        profile_img: u.personal_info?.profile_img ?? '',
      },
    }));

    return sendResponse(res, 200, 'Online users fetched successfully', data);
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getOnlineUsers;
