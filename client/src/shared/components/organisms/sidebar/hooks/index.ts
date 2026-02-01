import { useCallback, useState, useMemo } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import NotesIcon from '@mui/icons-material/Notes';
import CodeIcon from '@mui/icons-material/Code';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import { SideBarItemsType } from '../typings';
import {
  ROUTES_PAGE_V1,
  ROUTES_V1,
} from '../../../../../app/routes/constants/routes';
import { useAuth } from '../../../../hooks/use-auth';

const logoutStyle = {
  marginTop: 'auto',
  marginBottom: 0,
};

const useSidebar = () => {
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { logout } = useAuth();

  // open modal
  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  // confirm logout
  const confirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
  }, [logout]);

  const handleMouseHoverIn = useCallback(() => {
    setShowExpandedView(true);
  }, []);

  const handleMouseHoverOut = useCallback(() => {
    setShowExpandedView(false);
  }, []);

  const sidebarItems = useMemo(() => {
    const items: SideBarItemsType[] = [
      {
        icon: HomeIcon,
        path: ROUTES_V1.HOME,
        title: 'Home',
        screenName: ROUTES_PAGE_V1.HOME,
      },
      {
        icon: ChatIcon,
        path: ROUTES_V1.CHATS,
        title: 'Chats',
        screenName: ROUTES_PAGE_V1.CHATS,
        hasAccess: false,
      },
      {
        icon: NotesIcon,
        path: ROUTES_V1.NOTES,
        title: 'Notes',
        screenName: ROUTES_PAGE_V1.NOTES,
        hasAccess: false,
      },
      {
        icon: CodeIcon,
        path: ROUTES_V1.CODE,
        title: 'Code',
        screenName: ROUTES_PAGE_V1.CODE,
        hasAccess: false,
      },
      {
        icon: SettingsIcon,
        path: ROUTES_V1.SETTINGS,
        title: 'Settings',
        screenName: ROUTES_PAGE_V1.SETTINGS,
      },
    ];

    const secondaryItems: SideBarItemsType[] = [
      {
        icon: PowerSettingsNewIcon,
        onClick: handleLogoutClick,
        title: 'Logout',
        style: logoutStyle,
      },
    ];

    return {
      items: items.filter(({ disable }) => !disable),
      secondaryItems: secondaryItems.filter(({ disable }) => !disable),
    };
  }, [handleLogoutClick]);

  return {
    showExpandedView,
    handleMouseHoverIn,
    handleMouseHoverOut,
    sidebarItems,

    // modal controls
    showLogoutModal,
    setShowLogoutModal,
    confirmLogout,
  };
};

export default useSidebar;
