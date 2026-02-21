import { post } from '../..';
import { ApiResponse } from '../../typings';

export interface InviteMemberPayload {
  email: string;
  role: string;
}

export interface InviteMemberResponseData {
  invite_id: string;
  email: string;
  role: string;
  expires_at: string;
}

export const inviteMember = async (payload: InviteMemberPayload) => {
  return post<InviteMemberPayload, ApiResponse<InviteMemberResponseData>>(
    '/api/organization/invite',
    true,
    payload
  );
};
