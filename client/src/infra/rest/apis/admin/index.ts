import { get, post } from '../..';
import { ApiResponse, BaseApiResponse } from '../../typings';

export interface PendingOrganization {
  _id: string;
  name: string;
  slug: string;
  requested_by_email: string;
  requested_by_name?: string;
  createdAt: string;
}

export interface GetPendingOrganizationsResponseData {
  organizations: PendingOrganization[];
}

export const getPendingOrganizations = async () => {
  return get<undefined, ApiResponse<GetPendingOrganizationsResponseData>>(
    '/api/admin/organizations/pending',
    true
  );
};

export const approveOrganization = async (orgId: string) => {
  return post<undefined, BaseApiResponse>(
    `/api/admin/organizations/${orgId}/approve`,
    true,
    undefined
  );
};

export const rejectOrganization = async (orgId: string) => {
  return post<undefined, BaseApiResponse>(
    `/api/admin/organizations/${orgId}/reject`,
    true,
    undefined
  );
};
