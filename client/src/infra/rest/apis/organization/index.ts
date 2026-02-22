import { get, post } from '../..';
import { ApiResponse } from '../../typings';

export interface RequestOrganizationPayload {
  name: string;
  slug: string;
  requested_by_email: string;
  requested_by_name?: string;
}

export interface RequestOrganizationResponseData {
  org_id: string;
}

export const requestOrganization = async (
  payload: RequestOrganizationPayload
) => {
  return post<
    RequestOrganizationPayload,
    ApiResponse<RequestOrganizationResponseData>
  >('/api/organization/request', false, payload);
};

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

export interface OrgMember {
  user_id: string;
  role: string;
  username: string | null;
  email: string | null;
  joined_at: string;
}

export interface PendingInvite {
  email: string;
  role: string;
  invited_at: string;
}

export interface GetMembersResponseData {
  members: OrgMember[];
  pending_invites: PendingInvite[];
}

export const getOrganizationMembers = async () => {
  return get<undefined, ApiResponse<GetMembersResponseData>>(
    '/api/organization/members',
    true
  );
};

export const inviteMember = async (payload: InviteMemberPayload) => {
  return post<InviteMemberPayload, ApiResponse<InviteMemberResponseData>>(
    '/api/organization/invite',
    true,
    payload
  );
};
