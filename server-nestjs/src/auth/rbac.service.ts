import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrganizationFeature } from '../organizations/types/organization.js';
import type { OrganizationMemberRole } from '../organizations/types/organization-member.js';

export const PERMISSIONS = {
  ARTICLES_READ: 'articles:read',
  ARTICLES_WRITE: 'articles:write',
  ARTICLES_DELETE: 'articles:delete',
  ARTICLES_MANAGE: 'articles:manage',
  CHATS_READ: 'chats:read',
  CHATS_WRITE: 'chats:write',
  CHATS_DELETE: 'chats:delete',
  CHATS_MANAGE: 'chats:manage',
  NOTES_READ: 'notes:read',
  NOTES_WRITE: 'notes:write',
  NOTES_DELETE: 'notes:delete',
  NOTES_MANAGE: 'notes:manage',
  CODE_READ: 'code:read',
  CODE_WRITE: 'code:write',
  CODE_DELETE: 'code:delete',
  CODE_MANAGE: 'code:manage',
  COLLABORATION_READ: 'collaboration:read',
  COLLABORATION_WRITE: 'collaboration:write',
  COLLABORATION_MANAGE: 'collaboration:manage',
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_WRITE: 'notifications:write',
  NOTIFICATIONS_MANAGE: 'notifications:manage',
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_WRITE: 'feedback:write',
  FEEDBACK_MANAGE: 'feedback:manage',
  ORG_MANAGE: 'org:manage',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_BILLING: 'org:manage_billing',
  ADMIN_PANEL: 'admin_panel:access',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LIST = Object.values(PERMISSIONS);

const VIEWER_PERMISSIONS: Permission[] = [
  PERMISSIONS.ARTICLES_READ,
  PERMISSIONS.CHATS_READ,
  PERMISSIONS.NOTES_READ,
  PERMISSIONS.CODE_READ,
  PERMISSIONS.COLLABORATION_READ,
  PERMISSIONS.NOTIFICATIONS_READ,
  PERMISSIONS.FEEDBACK_READ,
];

const MEMBER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.ARTICLES_WRITE,
  PERMISSIONS.ARTICLES_DELETE,
  PERMISSIONS.CHATS_WRITE,
  PERMISSIONS.CHATS_DELETE,
  PERMISSIONS.NOTES_WRITE,
  PERMISSIONS.NOTES_DELETE,
  PERMISSIONS.CODE_WRITE,
  PERMISSIONS.CODE_DELETE,
  PERMISSIONS.COLLABORATION_WRITE,
  PERMISSIONS.NOTIFICATIONS_WRITE,
  PERMISSIONS.FEEDBACK_WRITE,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  PERMISSIONS.ARTICLES_MANAGE,
  PERMISSIONS.CHATS_MANAGE,
  PERMISSIONS.NOTES_MANAGE,
  PERMISSIONS.CODE_MANAGE,
  PERMISSIONS.COLLABORATION_MANAGE,
  PERMISSIONS.NOTIFICATIONS_MANAGE,
  PERMISSIONS.FEEDBACK_MANAGE,
  PERMISSIONS.ORG_MANAGE,
  PERMISSIONS.ORG_MANAGE_MEMBERS,
  PERMISSIONS.ORG_MANAGE_BILLING,
];

const ROLE_PERMISSIONS: Record<OrganizationMemberRole, Permission[]> = {
  viewer: VIEWER_PERMISSIONS,
  member: MEMBER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  owner: ADMIN_PERMISSIONS,
};

@Injectable()
export class RbacService {
  constructor(private readonly config: ConfigService) {}

  getPermissions(
    role: OrganizationMemberRole,
    enabledFeatures: OrganizationFeature[],
    organizationId: string,
  ): Permission[] {
    const permissions = [...ROLE_PERMISSIONS[role]];
    const platformAdminOrganizationId = this.config.get<string>(
      'PLATFORM_ADMIN_ORG_ID',
    );

    if (
      role === 'owner' &&
      platformAdminOrganizationId &&
      organizationId === platformAdminOrganizationId
    ) {
      permissions.push(PERMISSIONS.ADMIN_PANEL);
    }

    return filterPermissionsByFeatures(permissions, enabledFeatures);
  }
}

export function filterPermissionsByFeatures(
  permissions: Permission[],
  enabledFeatures: OrganizationFeature[],
): Permission[] {
  const featureSet = new Set<string>(enabledFeatures);

  return permissions.filter((permission) => {
    const feature = permission.split(':')[0];
    return (
      feature === 'org' || feature === 'admin_panel' || featureSet.has(feature)
    );
  });
}

export function isPermission(value: unknown): value is Permission {
  return (
    typeof value === 'string' && PERMISSION_LIST.includes(value as Permission)
  );
}
