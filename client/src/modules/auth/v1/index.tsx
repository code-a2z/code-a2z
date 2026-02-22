import { Box, Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InputBox from '../../../shared/components/atoms/input-box';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import LoginIcon from '@mui/icons-material/Login';
import A2ZButton from '../../../shared/components/atoms/button';
import { useUserAuthForm } from './hooks';
import { ROUTE_REQUEST_ORG } from '../../../app/routes/constants/routes';

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
  fontSize: '2.5rem',
  fontFamily: 'Gelasio, serif',
  textTransform: 'capitalize',
  textAlign: 'center',
  marginBottom: theme.spacing(6),
}));

const UserAuthForm = () => {
  const { loading, handleSubmit } = useUserAuthForm();

  return (
    <StyledSection>
      <StyledForm id="formElement" onSubmit={handleSubmit}>
        <StyledTitle>Welcome back</StyledTitle>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <InputBox
            id="auth-form-email"
            name="email"
            type="email"
            placeholder="Email"
            fullWidth
            icon={<EmailIcon />}
          />

          <InputBox
            id="auth-form-password"
            name="password"
            type="password"
            placeholder="Password"
            fullWidth
            icon={<PasswordIcon />}
          />

          <A2ZButton
            type="submit"
            sx={{
              mt: 2,
              display: 'flex',
              gap: 1,
            }}
            loading={loading}
            loadingPosition="end"
          >
            Login
            <LoginIcon />
          </A2ZButton>
          <Typography sx={{ mt: 2 }}>
            <Link component={RouterLink} to={ROUTE_REQUEST_ORG}>
              Request organization
            </Link>
          </Typography>
        </Box>
      </StyledForm>
    </StyledSection>
  );
};

export default UserAuthForm;
