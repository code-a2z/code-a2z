import { FormEvent, useState } from 'react';
import { Box, Link, styled, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InputBox from '../../../shared/components/atoms/input-box';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import A2ZButton from '../../../shared/components/atoms/button';
import { requestOrganization } from '../../../infra/rest/apis/organization';
import { useNotifications } from '../../../shared/hooks/use-notification';

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

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RequestOrgPage() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const form = new FormData(e.currentTarget);
      const name = (form.get('name') as string)?.trim() ?? '';
      const slug = (form.get('slug') as string)?.trim().toLowerCase() ?? '';
      const requested_by_email =
        (form.get('requested_by_email') as string)?.trim().toLowerCase() ?? '';
      const requested_by_name =
        (form.get('requested_by_name') as string)?.trim() || undefined;

      if (!name) {
        addNotification({
          message: 'Organization name is required',
          type: 'error',
        });
        return;
      }
      if (!slug) {
        addNotification({
          message: 'Organization slug is required',
          type: 'error',
        });
        return;
      }
      if (!slugRegex.test(slug)) {
        addNotification({
          message: 'Slug must be lowercase letters, numbers, and hyphens only',
          type: 'error',
        });
        return;
      }
      if (!requested_by_email) {
        addNotification({ message: 'Your email is required', type: 'error' });
        return;
      }
      if (!emailRegex.test(requested_by_email)) {
        addNotification({
          message: 'Please enter a valid email',
          type: 'error',
        });
        return;
      }

      const response = await requestOrganization({
        name,
        slug,
        requested_by_email,
        requested_by_name,
      });

      if (response.status === 'success') {
        setSuccess(true);
        addNotification({
          message:
            response.message ??
            "Request submitted. You'll be notified once reviewed.",
          type: 'success',
        });
      } else {
        addNotification({
          message: response.message ?? 'Request failed. Please try again.',
          type: 'error',
        });
      }
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      const message =
        axErr?.response?.data?.message ??
        'Something went wrong. Please try again.';
      addNotification({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <StyledSection>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <StyledTitle>Request submitted</StyledTitle>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Request submitted. You&apos;ll be notified once reviewed.
          </Typography>
          <Typography>
            <Link component={RouterLink} to="/">
              Back to login
            </Link>
          </Typography>
        </Box>
      </StyledSection>
    );
  }

  return (
    <StyledSection>
      <StyledForm id="request-org-form" onSubmit={handleSubmit}>
        <StyledTitle>Request organization</StyledTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InputBox
            id="request-org-name"
            name="name"
            type="text"
            placeholder="Organization name"
            fullWidth
            icon={<BusinessIcon />}
          />
          <InputBox
            id="request-org-slug"
            name="slug"
            type="text"
            placeholder="Slug (e.g. my-org)"
            fullWidth
            icon={<BusinessIcon />}
          />
          <InputBox
            id="request-org-email"
            name="requested_by_email"
            type="email"
            placeholder="Your email (required)"
            fullWidth
            icon={<EmailIcon />}
          />
          <InputBox
            id="request-org-requester-name"
            name="requested_by_name"
            type="text"
            placeholder="Your name (optional)"
            fullWidth
            icon={<PersonIcon />}
          />
          <A2ZButton
            type="submit"
            sx={{ mt: 2, display: 'flex', gap: 1 }}
            loading={loading}
            loadingPosition="end"
          >
            Submit request
          </A2ZButton>
          <Typography sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/">
              Back to login
            </Link>
          </Typography>
        </Box>
      </StyledForm>
    </StyledSection>
  );
}
