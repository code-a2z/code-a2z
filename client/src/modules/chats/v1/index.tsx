import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  List,
  ListItemButton,
  Avatar,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { getOnlineUsers, reportPresence } from '../../../infra/rest/apis/chat';
import { OnlineUser } from '../../../infra/rest/apis/chat/typing';
import { CHATS_SIDEBAR_WIDTH, ONLINE_USERS_POLL_INTERVAL_MS, PRESENCE_REFRESH_INTERVAL_MS } from './constants';

const Chats = () => {
  const theme = useTheme();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null);

  const fetchPresenceAndOnlineUsers = useCallback(async () => {
    try {
      await reportPresence();
      const res = await getOnlineUsers();
      if (res.status === 'success' && res.data) {
        setOnlineUsers(res.data);
      }
    } catch {
      setOnlineUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresenceAndOnlineUsers();
  }, [fetchPresenceAndOnlineUsers]);

  useEffect(() => {
    const pollInterval = setInterval(fetchPresenceAndOnlineUsers, ONLINE_USERS_POLL_INTERVAL_MS);
    return () => clearInterval(pollInterval);
  }, [fetchPresenceAndOnlineUsers]);

  useEffect(() => {
    const presenceInterval = setInterval(reportPresence, PRESENCE_REFRESH_INTERVAL_MS);
    return () => clearInterval(presenceInterval);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: CHATS_SIDEBAR_WIDTH,
          minWidth: CHATS_SIDEBAR_WIDTH,
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" component="h1">
            Chats
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Logged-in users
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : onlineUsers.length === 0 ? (
            <Box sx={{ px: 2, py: 4 }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No other users online. Open this page in another browser or ask a friend to open the chat page.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {onlineUsers.map((user) => (
                <ListItemButton
                  key={user._id}
                  selected={selectedUser?._id === user._id}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    gap: 1.5,
                    py: 1.5,
                  }}
                >
                  <Avatar
                    src={user.personal_info?.profile_img}
                    alt={user.personal_info?.fullname}
                    sx={{ width: 40, height: 40 }}
                  >
                    {(user.personal_info?.fullname?.[0] || user.personal_info?.username?.[0] || '?').toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body1" noWrap>
                      {user.personal_info?.fullname || user.personal_info?.username || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      @{user.personal_info?.username || '—'}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        {!selectedUser ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Select a user to start a chat session. Real-time messaging will be available in a future update.
          </Typography>
        ) : (
          <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
            <Avatar
              src={selectedUser.personal_info?.profile_img}
              alt={selectedUser.personal_info?.fullname}
              sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5 }}
            >
              {(selectedUser.personal_info?.fullname?.[0] || selectedUser.personal_info?.username?.[0] || '?').toUpperCase()}
            </Avatar>
            <Typography variant="h6">
              Chat with {selectedUser.personal_info?.fullname || selectedUser.personal_info?.username || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              @{selectedUser.personal_info?.username || '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Chat session prepared. Real-time messaging will be available in a future update.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chats;
