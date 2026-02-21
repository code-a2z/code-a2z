import { lazy } from 'react';

export const ProfileLazyComponentV1 = lazy(() => import('./profile/v1'));
export const IntegrationsLazyComponentV1 = lazy(
  () => import('./integrations/v1')
);
export const OpenAILazyComponentV1 = lazy(
  () => import('./integrations/modules/openai/v1')
);
export const ManageArticlesLazyComponentV1 = lazy(
  () => import('./manage-articles/v1')
);
export const NotificationLazyComponentV1 = lazy(
  () => import('./notification/v1')
);
export const TeamLazyComponentV1 = lazy(() => import('./team/v1'));
