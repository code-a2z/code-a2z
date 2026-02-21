import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from '../../shared/components/molecules/loader';
import { LOADING } from './constants';
import { LoginLazyComponent, AcceptInviteLazyComponent } from '../components';
import { ROUTE_ACCEPT_INVITE } from './constants/routes';

export function AppUnProtectedRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTE_ACCEPT_INVITE}
        element={
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <AcceptInviteLazyComponent />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <LoginLazyComponent />
          </Suspense>
        }
      />
    </Routes>
  );
}
