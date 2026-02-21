import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useHasPermission } from '../../../hooks/use-has-permission';
import { ROUTES_V1 } from '../../../../app/routes/constants/routes';

type PermissionGuardProps = {
  feature: string;
  action: string;
  children: ReactNode;
  fallbackTo?: string;
};

/**
 * Renders children only if the user has the given permission and feature is enabled for the org.
 * Otherwise redirects to fallbackTo (default: app home). Use for route-level RBAC.
 */
export default function PermissionGuard({
  feature,
  action,
  children,
  fallbackTo = ROUTES_V1.HOME,
}: PermissionGuardProps) {
  const hasAccess = useHasPermission(feature, action);
  if (!hasAccess) {
    return <Navigate to={fallbackTo} replace />;
  }
  return <>{children}</>;
}
