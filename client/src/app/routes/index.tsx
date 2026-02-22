import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from '../../shared/components/molecules/loader';
import { LOADING } from './constants';
import {
  LoginLazyComponent,
  AcceptInviteLazyComponent,
  RequestOrgLazyComponent,
} from '../components';
import { ROUTE_ACCEPT_INVITE, ROUTE_REQUEST_ORG } from './constants/routes';

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
        path={ROUTE_REQUEST_ORG}
        element={
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <RequestOrgLazyComponent />
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
