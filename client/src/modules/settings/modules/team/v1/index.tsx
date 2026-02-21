import { Box, Typography, MenuItem } from '@mui/material';
import InputBox from '../../../../../shared/components/atoms/input-box';
import EmailIcon from '@mui/icons-material/Email';
import A2ZButton from '../../../../../shared/components/atoms/button';
import { useInviteForm } from './hooks';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

export default function TeamSettingsV1() {
  const { loading, successMessage, handleSubmit } = useInviteForm();

  return (
    <Box sx={{ p: 2, maxWidth: 480 }}>
      <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Gelasio, serif' }}>
        Team members
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        Invite people to this organization by email. They will receive a link to
        set their password and join.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
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
        <Typography color="success.main" sx={{ mt: 2 }}>
          {successMessage}
        </Typography>
      )}
    </Box>
  );
}
