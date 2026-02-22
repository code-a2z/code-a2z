import { Box, styled, Typography } from '@mui/material';
import InputBox from '../../../shared/components/atoms/input-box';
import PersonIcon from '@mui/icons-material/Person';
import PasswordIcon from '@mui/icons-material/Lock';
import A2ZButton from '../../../shared/components/atoms/button';
import { useSetPasswordForm } from './hooks/use-set-password-form';
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

export default function SetPasswordPage() {
  const { token, orgName, loading, loadingInfo, error, handleSubmit } =
    useSetPasswordForm();

  if (!token) {
    return (
      <StyledSection>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <StyledTitle>Invalid link</StyledTitle>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            This set-password link is missing a token. Please use the link from
            your approval email.
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
        <Typography color="text.secondary">Loading…</Typography>
      </StyledSection>
    );
  }

  if (error && !orgName) {
    return (
      <StyledSection>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <StyledTitle>Link invalid or expired</StyledTitle>
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
      <StyledForm id="set-password-form" onSubmit={handleSubmit}>
        <StyledTitle>
          Set your password for {orgName ?? 'organization'}
        </StyledTitle>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Choose a password and your display name to access your account.
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
            id="set-password-fullname"
            name="fullname"
            type="text"
            placeholder="Full name (min 3 characters)"
            fullWidth
            icon={<PersonIcon />}
          />
          <InputBox
            id="set-password-password"
            name="password"
            type="password"
            placeholder="Password (min 6, upper, lower, number)"
            fullWidth
            icon={<PasswordIcon />}
          />
          <InputBox
            id="set-password-confirm"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            fullWidth
            icon={<PasswordIcon />}
          />
          <A2ZButton
            type="submit"
            sx={{ mt: 2 }}
            loading={loading}
            loadingPosition="end"
          >
            Set password
          </A2ZButton>
        </Box>
      </StyledForm>
    </StyledSection>
  );
}
