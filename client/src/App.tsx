import { memo, useEffect, useMemo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { setupTokenRefresh } from './shared/utils/api-interceptor';
import { AppUnProtectedRoutes } from './app/routes';
import { AppProtectedRoutes } from './app/routes/auth-routes';
import useScrollbar from './shared/components/atoms/scrollbar';
import { useAuth } from './shared/hooks/use-auth';
import { ROUTE_SELECT_ORG } from './app/routes/constants/routes';
import SelectOrgPage from './modules/auth/v1/select-org-page';

const App = memo(() => {
  const { GlobalScrollbar } = useScrollbar();
  const { token, selectedOrgId, initialized } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const hasOrgContext = useMemo(() => !!selectedOrgId, [selectedOrgId]);

  useEffect(() => {
    setupTokenRefresh();
  }, []);

  if (!initialized) {
    return null;
  }

  if (!hasToken) {
    return (
      <>
        <GlobalScrollbar />
        <AppUnProtectedRoutes />
      </>
    );
  }

  if (!hasOrgContext) {
    return (
      <>
        <GlobalScrollbar />
        <Routes>
          <Route path={ROUTE_SELECT_ORG} element={<SelectOrgPage />} />
          <Route
            path="*"
            element={<Navigate to={ROUTE_SELECT_ORG} replace />}
          />
        </Routes>
      </>
    );
  }

  return (
    <>
      <GlobalScrollbar />
      <AppProtectedRoutes />
    </>
  );
});

export default App;
