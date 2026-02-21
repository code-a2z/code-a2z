import { useMemo } from 'react';
import { useAuth } from './use-auth';

/**
 * Permission format: "feature:action" (e.g. "chats:read", "articles:write").
 * User must have the permission in their list AND the feature must be enabled for the org.
 */
export function useHasPermission(feature: string, action: string): boolean {
  const { permissions, orgFeatures } = useAuth();
  return useMemo(() => {
    const permission = `${feature}:${action}`;
    const hasPerm = permissions.includes(permission);
    const featureEnabled = orgFeatures.includes(feature);
    return Boolean(hasPerm && featureEnabled);
  }, [feature, action, permissions, orgFeatures]);
}
