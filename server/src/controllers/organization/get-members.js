/**
 * GET /api/organization/members - List org members and pending invites.
 * Auth + requireOrgScope. All org members can view. Returns members (role, username, email, joined_at)
 * and pending invites (email, role, invited_at).
 */

import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import ORGANIZATION_INVITE from '../../models/organization-invite.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { sendResponse } from '../../utils/response.js';

const getMembers = async (req, res) => {
  const orgId = req.user?.org_id;

  if (!orgId) {
    return sendResponse(res, 403, 'Organization context required');
  }

  try {
    const members = await ORGANIZATION_MEMBER.find({ org_id: orgId })
      .populate('user_id', 'personal_info.username personal_info.subscriber_id')
      .sort({ createdAt: 1 })
      .lean();

    const subscriberIds = members
      .map(m => m.user_id?.personal_info?.subscriber_id)
      .filter(Boolean);

    const subscribers = await SUBSCRIBER.find({ _id: { $in: subscriberIds } })
      .select('email')
      .lean();

    const emailBySubscriberId = new Map(
      subscribers.map(s => [s._id.toString(), s.email])
    );

    const membersList = members.map(m => {
      const user = m.user_id;
      const subscriberId = user?.personal_info?.subscriber_id?.toString();
      const email = subscriberId ? emailBySubscriberId.get(subscriberId) : null;
      return {
        user_id: m.user_id?._id,
        role: m.role,
        username: user?.personal_info?.username ?? null,
        email: email ?? null,
        joined_at: m.createdAt,
      };
    });

    const pendingInvites = await ORGANIZATION_INVITE.find({
      org_id: orgId,
      status: 'pending',
      expires_at: { $gt: new Date() },
    })
      .select('email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const invitesList = pendingInvites.map(inv => ({
      email: inv.email,
      role: inv.role,
      invited_at: inv.createdAt,
    }));

    return sendResponse(res, 200, 'Members and invites', {
      members: membersList,
      pending_invites: invitesList,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getMembers;
