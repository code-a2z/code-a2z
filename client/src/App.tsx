import { memo, useEffect, useMemo } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { setupTokenRefresh } from './shared/utils/api-interceptor';
import { AppUnProtectedRoutes } from './app/routes';
import { AppProtectedRoutes } from './app/routes/auth-routes';
import useScrollbar from './shared/components/atoms/scrollbar';
import { useAuth } from './shared/hooks/use-auth';
import { ROUTE_SELECT_ORG } from './app/routes/constants/routes';
import SelectOrgPage from './modules/auth/v1/select-org-page';
import { SelectedOrgIdAtom } from './infra/states/org';

const App = memo(() => {
  const { GlobalScrollbar } = useScrollbar();
  const navigate = useNavigate();
  const setSelectedOrgId = useSetAtom(SelectedOrgIdAtom);
  const { token, selectedOrgId, initialized } = useAuth();
  const hasToken = useMemo(() => !!token, [token]);
  const hasOrgContext = useMemo(() => !!selectedOrgId, [selectedOrgId]);

  useEffect(() => {
    setupTokenRefresh();
  }, []);

  useEffect(() => {
    const handler = () => {
      setSelectedOrgId(null);
      navigate(ROUTE_SELECT_ORG, { replace: true });
    };
    window.addEventListener('org-context-required', handler);
    return () => window.removeEventListener('org-context-required', handler);
  }, [navigate, setSelectedOrgId]);

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
