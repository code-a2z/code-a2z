import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from '../../shared/components/molecules/loader';
import { LOADING } from './constants';
import { LoginLazyComponent, ResetPasswordLazyComponent } from '../components';

export function AppUnProtectedRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <LoginLazyComponent />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <ResetPasswordLazyComponent />
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
