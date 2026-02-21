import { Box, styled, Typography } from '@mui/material';
import InputBox from '../../../shared/components/atoms/input-box';
import PersonIcon from '@mui/icons-material/Person';
import PasswordIcon from '@mui/icons-material/Password';
import A2ZButton from '../../../shared/components/atoms/button';
import { useAcceptInviteForm } from './hooks/use-accept-invite-form';
import { Link } from 'react-router-dom';

const StyledSection = styled('section')(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: '5vw',
  paddingRight: '5vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
}));

const StyledForm = styled('form')(() => ({
  width: '80%',
  maxWidth: 400,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontFamily: 'Gelasio, serif',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

export default function AcceptInvitePage() {
  const { token, orgName, loading, loadingInfo, error, handleSubmit } =
    useAcceptInviteForm();

  if (!token) {
    return (
      <StyledSection>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <StyledTitle>Invalid invite link</StyledTitle>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            This invite link is missing a token. Please use the link from your
            invitation email.
          </Typography>
          <Typography component={Link} to="/" sx={{ color: 'primary.main' }}>
            Back to login
          </Typography>
        </Box>
      </StyledSection>
    );
  }

  if (loadingInfo) {
    return (
      <StyledSection>
        <Typography color="text.secondary">Loading invite details…</Typography>
      </StyledSection>
    );
  }

  if (error && !orgName) {
    return (
      <StyledSection>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <StyledTitle>Invite invalid or expired</StyledTitle>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Typography component={Link} to="/" sx={{ color: 'primary.main' }}>
            Back to login
          </Typography>
        </Box>
      </StyledSection>
    );
  }

  return (
    <StyledSection>
      <StyledForm id="accept-invite-form" onSubmit={handleSubmit}>
        <StyledTitle>Join {orgName ?? 'organization'}</StyledTitle>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Set your name and password to accept the invite.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InputBox
            id="accept-invite-fullname"
            name="fullname"
            type="text"
            placeholder="Full name"
            fullWidth
            icon={<PersonIcon />}
          />
          <InputBox
            id="accept-invite-password"
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            fullWidth
            icon={<PasswordIcon />}
          />
          <A2ZButton
            type="submit"
            sx={{ mt: 2 }}
            loading={loading}
            loadingPosition="end"
          >
            Accept invite
          </A2ZButton>
        </Box>
      </StyledForm>
    </StyledSection>
  );
}
