import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import {
  ROUTES_V1,
  ROUTES_SETTINGS_V1,
  ROUTES_SETTINGS_INTEGRATIONS_V1,
} from '../../../app/routes/constants/routes';
import { IntegrationSettingType, SettingTabType } from '../v1/typings';
import { Navigate, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { ProtectedRoute } from '../../../app/routes/auth-routes/protected-route';
import PermissionGuard from '../../../shared/components/atoms/permission-guard';
import Loader from '../../../shared/components/molecules/loader';
import { LOADING } from '../../../app/routes/constants';
import {
  ProfileLazyComponentV1,
  IntegrationsLazyComponentV1,
  OpenAILazyComponentV1,
  ManageArticlesLazyComponentV1,
  NotificationLazyComponentV1,
  TeamLazyComponentV1,
} from '../modules';
import OpenAIIcon from '../../../shared/icons/openai';

export const settingsRoutes = ({
  isMobileOrTablet,
}: {
  isMobileOrTablet: boolean;
}) => {
  const settings: SettingTabType[] = [
    {
      id: 'profile',
      icon: <AccountCircleOutlinedIcon sx={{ fontSize: 20 }} />,
      path: ROUTES_SETTINGS_V1.PROFILE,
      name: 'Your profile',
      description: 'Manage your personal details and preferences',
    },
    {
      id: 'notification',
      icon: <NotificationsIcon sx={{ fontSize: 20 }} />,
      path: ROUTES_SETTINGS_V1.NOTIFICATION,
      name: 'Notifications',
      description: 'Stay updated with your latest activity and interactions',
    },
    {
      id: 'manage-articles',
      icon: <ArticleIcon sx={{ fontSize: 20 }} />,
      path: ROUTES_SETTINGS_V1.MANAGE_ARTICLES,
      name: 'Manage Articles',
      description: 'Edit, publish, and manage your articles',
    },
    {
      id: 'integrations',
      icon: <ExtensionIcon sx={{ fontSize: 20 }} />,
      path: ROUTES_SETTINGS_V1.INTEGRATIONS,
      name: 'Integrations',
      description: 'Connect your accounts and services',
    },
    {
      id: 'team',
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
      path: ROUTES_SETTINGS_V1.TEAM,
      name: 'Team',
      description: 'Invite and manage organization members',
    },
  ];

  const routes: React.ReactNode[] = [
    <Route
      key={ROUTES_SETTINGS_V1.PROFILE}
      path={ROUTES_SETTINGS_V1.PROFILE}
      element={
        <ProtectedRoute component={ProfileLazyComponentV1} hasAccess={true} />
      }
    />,
    <Route
      key={ROUTES_SETTINGS_V1.NOTIFICATION}
      path={ROUTES_SETTINGS_V1.NOTIFICATION}
      element={
        <ProtectedRoute
          component={NotificationLazyComponentV1}
          hasAccess={true}
        />
      }
    />,
    <Route
      key={ROUTES_SETTINGS_V1.MANAGE_ARTICLES}
      path={ROUTES_SETTINGS_V1.MANAGE_ARTICLES}
      element={
        <ProtectedRoute
          component={ManageArticlesLazyComponentV1}
          hasAccess={true}
        />
      }
    />,
    <Route
      key={`${ROUTES_SETTINGS_V1.INTEGRATIONS}/*`}
      path={`${ROUTES_SETTINGS_V1.INTEGRATIONS}/*`}
      element={
        <ProtectedRoute
          component={IntegrationsLazyComponentV1}
          hasAccess={true}
        />
      }
    />,
    <Route
      key={ROUTES_SETTINGS_V1.TEAM}
      path={ROUTES_SETTINGS_V1.TEAM}
      element={
        <PermissionGuard feature="org" action="manage_members">
          <Suspense fallback={<Loader size={32} secondary={LOADING} />}>
            <TeamLazyComponentV1 />
          </Suspense>
        </PermissionGuard>
      }
    />,

    !isMobileOrTablet && (
      <Route
        key="*"
        path="*"
        element={
          <Navigate
            to={`${ROUTES_V1.SETTINGS}${ROUTES_SETTINGS_V1.PROFILE}`}
            replace
          />
        }
      />
    ),
  ];

  return {
    settings,
    routes,
  };
};

export const integrationsRoutes = ({
  isMobileOrTablet,
}: {
  isMobileOrTablet: boolean;
}) => {
  const integrations: IntegrationSettingType[] = [
    {
      id: 'openai',
      integrationSlug: 'openai',
      icon: <OpenAIIcon width={20} height={20} />,
      name: 'OpenAI',
      description: 'Setup your OpenAI integration',
      locked: false,
    },
  ];

  const routes: React.ReactNode[] = [
    <Route
      key={ROUTES_SETTINGS_INTEGRATIONS_V1.OPENAI}
      path={ROUTES_SETTINGS_INTEGRATIONS_V1.OPENAI}
      element={
        <ProtectedRoute component={OpenAILazyComponentV1} hasAccess={true} />
      }
    />,

    !isMobileOrTablet && (
      <Route
        key="*"
        path="*"
        element={
          <Navigate
            to={`${ROUTES_V1.SETTINGS}${ROUTES_SETTINGS_V1.INTEGRATIONS}${ROUTES_SETTINGS_INTEGRATIONS_V1.OPENAI}`}
            replace
          />
        }
      />
    ),
  ];

  return {
    integrations,
    routes,
  };
};
