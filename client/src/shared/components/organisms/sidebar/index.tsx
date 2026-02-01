import {
  Box,
  Typography,
  SxProps,
  Theme,
  ButtonBase,
  Button,
  Modal,
} from '@mui/material';
import { ORGANISATION_TITLE_HEIGHT, SIDEBAR_WIDTH } from './constants';
import useSidebar from './hooks';
import SidebarMenuItem from './components/SidebarMenuItem';
import { appVersion, ORGANISATION_NAME } from '../../../../config/env';
import A2ZTypography from '../../atoms/typography';
import ProfileAvatar from '../../molecules/profile-avatar';

const Sidebar = () => {
  const {
    showExpandedView,
    handleMouseHoverIn,
    handleMouseHoverOut,
    sidebarItems,
    showLogoutModal,
    setShowLogoutModal,
    confirmLogout,
  } = useSidebar();

  const { items, secondaryItems } = sidebarItems;

  return (
    <>
      <Box
        onMouseEnter={handleMouseHoverIn}
        onMouseLeave={handleMouseHoverOut}
        sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          flexGrow: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          height: '100%',
          top: 0,
          zIndex: theme => theme.zIndex.drawer + 1,
          left: 0,
          width: showExpandedView ? '230px' : `${SIDEBAR_WIDTH}px`,
          minWidth: showExpandedView ? '230px' : `${SIDEBAR_WIDTH}px`,
          maxWidth: showExpandedView ? '230px' : `${SIDEBAR_WIDTH}px`,
          transition:
            'width 280ms ease-in-out, min-width 280ms ease-in-out, max-width 280ms ease-in-out',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: `${ORGANISATION_TITLE_HEIGHT}px`,
            minHeight: `${ORGANISATION_TITLE_HEIGHT}px`,
            width: '100%',
            overflow: showExpandedView ? 'auto' : 'hidden',
            transition: 'all 280ms ease-in-out',
            flex: '0 1 auto',
          }}
        >
          <ButtonBase
            component="div"
            sx={{
              height: `${ORGANISATION_TITLE_HEIGHT}px`,
              width: '100%',
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: showExpandedView ? 'space-between' : 'center',
              textAlign: 'left',
              margin: 0,
              cursor: 'pointer',
              padding: showExpandedView ? '0px 8px 0px 16px' : '0px 8px',
              borderBottom: 1,
              borderColor: 'divider',
              transition: 'background-color 200ms ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {showExpandedView ? (
              <A2ZTypography
                text={ORGANISATION_NAME}
                props={{
                  sx: {
                    fontWeight: 600,
                    width: 'calc(100% - 28px)',
                    paddingRight: '12px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    wordWrap: 'break-word',
                    wordBreak: 'break-all',
                    color: 'text.primary',
                  },
                }}
              />
            ) : (
              <ProfileAvatar
                name={ORGANISATION_NAME}
                styles={{
                  width: 36,
                  height: 36,
                  margin: 0,
                }}
              />
            )}
          </ButtonBase>
        </Box>

        {/* Main Items */}
        <Box
          sx={{
            width: '100%',
            flex: '1 1 auto',
            transition: 'all 280ms ease-in-out',
            overflow: 'hidden',
            '&:hover': {
              overflowY: 'auto',
              scrollbarGutter: 'stable',
            },
          }}
        >
          {items.map((item, index) => (
            <SidebarMenuItem
              key={index}
              Icon={item.icon}
              title={item.title}
              path={item.path}
              showExpandedView={showExpandedView}
              onClick={item.onClick}
              hasAccess={item.hasAccess}
              style={item.style as SxProps<Theme>}
              component={item.component}
              screenName={item.screenName}
              hideRipple={item.hideRipple}
              hide={item.hide}
            />
          ))}
        </Box>

        {/* Secondary Items (Logout) */}
        <Box sx={{ width: '100%', flex: '0 1 auto' }}>
          {secondaryItems.map((item, index) => (
            <SidebarMenuItem
              key={index}
              Icon={item.icon}
              title={item.title}
              path={item.path}
              showExpandedView={showExpandedView}
              onClick={item.onClick}
              hasAccess={item.hasAccess}
              style={item.style as SxProps<Theme>}
              component={item.component}
              screenName={item.screenName}
              hideRipple={item.hideRipple}
            />
          ))}
        </Box>

        {/* App Version */}
        {appVersion && (
          <Box
            sx={{
              padding: showExpandedView ? '8px 16px' : '8px 0px',
              fontSize: '12px',
              fontWeight: 600,
              height: '34px',
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              opacity: showExpandedView ? 1 : 0,
              whiteSpace: 'nowrap',
              flex: '0 1 auto',
              transition: 'all 280ms ease-in-out',
              color: 'text.secondary',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'text.secondary',
                textAlign: showExpandedView ? 'left' : 'center',
                width: '100%',
              }}
            >
              {showExpandedView ? `APP VERSION: ${appVersion}` : appVersion}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Logout Confirmation Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Typography fontWeight={600} mb={1}>
            Confirm Logout
          </Typography>

          <Typography variant="body2" mb={3}>
            Are you sure you want to logout?
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setShowLogoutModal(false)}
            >
              No
            </Button>
            <Button variant="contained" color="error" onClick={confirmLogout}>
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Sidebar;
