// client/src/modules/auth/v1/reset-password/index.tsx

import { Box, styled, Typography } from '@mui/material';
import InputBox from '../../../../shared/components/atoms/input-box';
import EmailIcon from '@mui/icons-material/Email';
import A2ZButton from '../../../../shared/components/atoms/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import A2ZTypography from '../../../../shared/components/atoms/typography';

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

const StyledFooter = styled('p')(({ theme }) => ({
  marginTop: theme.spacing(6),
  color: theme.palette.text.secondary,
  fontSize: '1.125rem',
  textAlign: 'center',
}));

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement password reset API call here
      console.log('Reset password for:', email);

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        alert('Password reset link sent to your email!');
        setEmail(''); // Clear email after success
      }, 2000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <StyledSection>
      <StyledForm onSubmit={handleSubmit}>
        <StyledTitle>Reset Password</StyledTitle>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Typography
            sx={{
              mb: 2,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            Enter your email address to receive a link to reset your password.
          </Typography>

          {error && (
            <Typography
              sx={{
                color: 'error.main',
                fontSize: '0.9rem',
                mb: 1,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {error}
            </Typography>
          )}

          <InputBox
            id="reset-email"
            name="email"
            type="email"
            placeholder="Email"
            fullWidth
            icon={<EmailIcon />}
            slotProps={{
              input: {
                value: email,
                onChange: handleEmailChange,
              },
            }}
          />

          <A2ZButton
            type="submit"
            sx={{
              mt: 2,
              width: '100%',
            }}
            loading={loading}
            disabled={!email || loading}
          >
            Send Reset Link
          </A2ZButton>
        </Box>

        <StyledFooter>
          Remember your password?{' '}
          <A2ZTypography
            text="Sign in here"
            component="span"
            props={{
              onClick: () => navigate('/'),
              sx: {
                fontSize: '1.125rem',
                marginLeft: 1,
                textDecoration: 'underline',
                color: 'inherit',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              },
            }}
          />
        </StyledFooter>
      </StyledForm>
    </StyledSection>
  );
};

export default ResetPassword;
