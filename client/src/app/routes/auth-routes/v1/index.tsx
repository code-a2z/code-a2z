import { Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { ROUTES_V1 } from '../../constants/routes';
import { LOADING } from '../../constants';
import Loader from '../../../../shared/components/molecules/loader';
import PermissionGuard from '../../../../shared/components/atoms/permission-guard';
import {
  HomePageLazyComponent,
  ChatsPageLazyComponent,
  NotesPageLazyComponent,
  CodePageLazyComponent,
  SettingsPageLazyComponent,
  AdminPageLazyComponent,
} from '../../../components';

export default function getRoutesV1() {
  const routes = [
    <Route
      key={`${ROUTES_V1.HOME}/*`}
      path={`${ROUTES_V1.HOME}/*`}
      element={
        <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
          <HomePageLazyComponent />
        </Suspense>
      }
    />,
    <Route
      key={`${ROUTES_V1.CHATS}/*`}
      path={`${ROUTES_V1.CHATS}/*`}
      element={
        <PermissionGuard feature="chats" action="read">
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <ChatsPageLazyComponent />
          </Suspense>
        </PermissionGuard>
      }
    />,
    <Route
      key={`${ROUTES_V1.NOTES}/*`}
      path={`${ROUTES_V1.NOTES}/*`}
      element={
        <PermissionGuard feature="notes" action="read">
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <NotesPageLazyComponent />
          </Suspense>
        </PermissionGuard>
      }
    />,
    <Route
      key={`${ROUTES_V1.CODE}/*`}
      path={`${ROUTES_V1.CODE}/*`}
      element={
        <PermissionGuard feature="code" action="read">
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <CodePageLazyComponent />
          </Suspense>
        </PermissionGuard>
      }
    />,
    <Route
      key={`${ROUTES_V1.SETTINGS}/*`}
      path={`${ROUTES_V1.SETTINGS}/*`}
      element={
        <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
          <SettingsPageLazyComponent />
        </Suspense>
      }
    />,
    <Route
      key={ROUTES_V1.ADMIN}
      path={ROUTES_V1.ADMIN}
      element={
        <PermissionGuard feature="admin_panel" action="access">
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <AdminPageLazyComponent />
          </Suspense>
        </PermissionGuard>
      }
    />,
  ];

  if (routes.length) {
    routes.push(
      <Route
        key="*"
        path="*"
        element={<Navigate to={ROUTES_V1.HOME} replace />}
      />
    );
  }

  return routes;
}
