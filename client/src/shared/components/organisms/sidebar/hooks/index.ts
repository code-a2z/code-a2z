import { useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import NotesIcon from '@mui/icons-material/Notes';
import CodeIcon from '@mui/icons-material/Code';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { SideBarItemsType } from '../typings';
import {
  ROUTES_PAGE_V1,
  ROUTES_V1,
  ROUTE_SELECT_ORG,
} from '../../../../../app/routes/constants/routes';
import { useAuth } from '../../../../hooks/use-auth';
import { useHasPermission } from '../../../../hooks/use-has-permission';

const logoutStyle = {
  marginTop: 'auto',
  marginBottom: 0,
};

const useSidebar = () => {
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const { logout, switchOrg } = useAuth();
  const hasChats = useHasPermission('chats', 'read');
  const hasNotes = useHasPermission('notes', 'read');
  const hasCode = useHasPermission('code', 'read');

  const handleSwitchOrg = useCallback(async () => {
    const switched = await switchOrg();
    if (switched) {
      navigate(ROUTE_SELECT_ORG, { replace: true });
    }
  }, [switchOrg, navigate]);

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
        hasAccess: hasChats,
      },
      {
        icon: NotesIcon,
        path: ROUTES_V1.NOTES,
        title: 'Notes',
        screenName: ROUTES_PAGE_V1.NOTES,
        hasAccess: hasNotes,
      },
      {
        icon: CodeIcon,
        path: ROUTES_V1.CODE,
        title: 'Code',
        screenName: ROUTES_PAGE_V1.CODE,
        hasAccess: hasCode,
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
        icon: SwapHorizIcon,
        onClick: () => {
          void handleSwitchOrg();
        },
        title: 'Switch organization',
      },
      {
        icon: PowerSettingsNewIcon,
        onClick: handleLogoutClick,
        title: 'Logout',
        style: logoutStyle,
      },
    ];

    return {
      items: items.filter(item => !item.disable && item.hasAccess !== false),
      secondaryItems: secondaryItems.filter(({ disable }) => !disable),
    };
  }, [handleLogoutClick, handleSwitchOrg, hasChats, hasNotes, hasCode]);

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
