import { useEffect } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import InputBox from '../../../../../shared/components/atoms/input-box';
import EmailIcon from '@mui/icons-material/Email';
import A2ZButton from '../../../../../shared/components/atoms/button';
import { useInviteForm, useMembers } from './hooks';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Loader from '../../../../../shared/components/molecules/loader';
import type {
  OrgMember,
  PendingInvite,
} from '../../../../../infra/rest/apis/organization';

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function TeamSettingsV1() {
  const {
    members,
    pendingInvites,
    loading: membersLoading,
    refetch,
  } = useMembers();
  const { loading, successMessage, handleSubmit } = useInviteForm({
    onSuccess: refetch,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Box sx={{ p: 2, maxWidth: 720 }}>
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Gelasio, serif' }}>
        Team members
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        Invite people to this organization by email. They will receive a link to
        set their password and join.
      </Typography>

      {/* Invite form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 4,
        }}
      >
        <InputBox
          id="invite-email"
          name="email"
          type="email"
          placeholder="Email address"
          fullWidth
          required
          icon={<EmailIcon />}
        />
        <FormControl fullWidth required>
          <InputLabel id="invite-role-label">Role</InputLabel>
          <Select
            labelId="invite-role-label"
            id="invite-role"
            name="role"
            label="Role"
            defaultValue="member"
          >
            {ROLES.map(r => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <A2ZButton type="submit" loading={loading} loadingPosition="end">
          Send invite
        </A2ZButton>
      </Box>

      {successMessage && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}

      {/* Members list */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Members
      </Typography>
      {membersLoading ? (
        <Loader size={32} />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" color="text.secondary">
                    No members yet.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m: OrgMember) => (
                  <TableRow key={m.user_id}>
                    <TableCell>
                      <Chip label={m.role} size="small" />
                    </TableCell>
                    <TableCell>{m.username ?? '—'}</TableCell>
                    <TableCell>{m.email ?? '—'}</TableCell>
                    <TableCell>{formatDate(m.joined_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pending invites */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Pending invites
      </Typography>
      {membersLoading ? null : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Invited</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingInvites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" color="text.secondary">
                    No pending invites.
                  </TableCell>
                </TableRow>
              ) : (
                pendingInvites.map((inv: PendingInvite, idx: number) => (
                  <TableRow key={`${inv.email}-${idx}`}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>
                      <Chip label={inv.role} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(inv.invited_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
