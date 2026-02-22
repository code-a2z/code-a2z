/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { lazy } from 'react';
import Navbar from '../../shared/components/organisms/navbar';
import { NAVBAR_HEIGHT } from '../../shared/components/organisms/navbar/constants';
import Sidebar from '../../shared/components/organisms/sidebar';
import { SIDEBAR_WIDTH } from '../../shared/components/organisms/sidebar/constants';
import { Routes } from 'react-router-dom';
import getRoutesV1 from '../routes/auth-routes/v1';

export const LoginLazyComponent = lazy(() => import('../../modules/auth/v1'));
export const AcceptInviteLazyComponent = lazy(
  () => import('../../modules/auth/v1/accept-invite-page')
);
export const RequestOrgLazyComponent = lazy(
  () => import('../../modules/auth/v1/request-org-page')
);
export const SetPasswordLazyComponent = lazy(
  () => import('../../modules/auth/v1/set-password-page')
);
export const HomePageLazyComponent = lazy(
  () => import('../../modules/home/v1')
);
export const ChatsPageLazyComponent = lazy(
  () => import('../../modules/chats/v1')
);
export const CodePageLazyComponent = lazy(
  () => import('../../modules/code/v1')
);
export const SettingsPageLazyComponent = lazy(
  () => import('../../modules/settings/v1')
);
export const NotesPageLazyComponent = lazy(
  () => import('../../modules/notes/v1')
);
export const AdminPageLazyComponent = lazy(
  () => import('../../modules/admin/v1')
);

export const AppLayout = () => {
  return (
    <>
      <Navbar />
      <div
        css={css`
          height: calc(100vh - ${NAVBAR_HEIGHT}px);
        `}
      >
        <div
          css={css`
            height: 100%;
            display: flex;
            flex: 1;
            position: relative;
          `}
        >
          <Sidebar />
          <div
            css={css`
              height: 100%;
              width: 100%;
              min-width: 100%;
              max-width: 100%;
              flex: 1;
              padding-left: ${SIDEBAR_WIDTH}px;
              overflow: hidden;
            `}
          >
            <div
              css={css`
                height: 100%;
                transition: height 500ms ease-in-out;
                width: 100%;
                min-width: 100%;
                max-width: 100%;
                overflow: hidden;
              `}
            >
              <Routes>{getRoutesV1()}</Routes>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
