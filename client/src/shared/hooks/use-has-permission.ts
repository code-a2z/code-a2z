import { useMemo } from 'react';
import { useAuth } from './use-auth';

/**
 * Permission format: "feature:action" (e.g. "chats:read", "articles:write").
 * User must have the permission in their list AND the feature must be enabled for the org.
 * Org-level and admin-panel permissions (feature === 'org' | 'admin_panel') are not gated by org features.
 */
export function useHasPermission(feature: string, action: string): boolean {
  const { permissions, orgFeatures } = useAuth();
  return useMemo(() => {
    const permission = `${feature}:${action}`;
    const hasPerm = permissions.includes(permission);
    if (feature === 'org' || feature === 'admin_panel') return hasPerm;
    const featureEnabled = orgFeatures.includes(feature);
    return Boolean(hasPerm && featureEnabled);
  }, [feature, action, permissions, orgFeatures]);
}
