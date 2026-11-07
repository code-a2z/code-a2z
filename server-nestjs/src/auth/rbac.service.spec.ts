import { ConfigService } from '@nestjs/config';
import {
  PERMISSIONS,
  RbacService,
  filterPermissionsByFeatures,
} from './rbac.service.js';

describe('RBAC helpers', () => {
  it('maps roles to their expected permissions', () => {
    const service = new RbacService(new ConfigService({}));

    expect(service.getPermissions('viewer', ['collaboration'], 'org-id')).toEqual([
      PERMISSIONS.COLLABORATION_READ,
    ]);
    expect(service.getPermissions('member', ['collaboration'], 'org-id')).toEqual([
      PERMISSIONS.COLLABORATION_READ,
      PERMISSIONS.COLLABORATION_WRITE
    ]);
    expect(service.getPermissions('admin', [], 'org-id')).toEqual([
      PERMISSIONS.ORG_MANAGE,
      PERMISSIONS.ORG_MANAGE_MEMBERS,
      PERMISSIONS.ORG_MANAGE_BILLING,
    ]);
  });

  it('removes permissions for disabled organization features', () => {
    expect(
      filterPermissionsByFeatures(
        [
          PERMISSIONS.COLLABORATION_READ,
          PERMISSIONS.NOTIFICATIONS_READ,
          PERMISSIONS.ORG_MANAGE,
        ],
        ['collaboration'],
      ),
    ).toEqual([
      PERMISSIONS.COLLABORATION_READ,
      PERMISSIONS.ORG_MANAGE,
    ]);
  });

  it('grants admin panel only to the platform organization owner', () => {
    const service = new RbacService(
      new ConfigService({ PLATFORM_ADMIN_ORG_ID: 'platform-org' }),
    );

    expect(service.getPermissions('owner', [], 'platform-org')).toContain(
      PERMISSIONS.ADMIN_PANEL,
    );
    expect(service.getPermissions('admin', [], 'platform-org')).not.toContain(
      PERMISSIONS.ADMIN_PANEL,
    );
    expect(service.getPermissions('owner', [], 'different-org')).not.toContain(
      PERMISSIONS.ADMIN_PANEL,
    );
  });
});
