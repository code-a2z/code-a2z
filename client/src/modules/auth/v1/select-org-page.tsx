import { Box, Typography, Card, CardActionArea } from '@mui/material';
import { useAuth } from '../../../../shared/hooks/use-auth';
import { ROUTES_V1 } from '../../../app/routes/constants/routes';
import A2ZButton from '../../../../shared/components/atoms/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SelectOrgPage() {
  const { orgs, selectOrg, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingOrgId, setLoadingOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectOrg = async (orgId: string) => {
    setError(null);
    setLoadingOrgId(orgId);
    try {
      await selectOrg(orgId);
      navigate(ROUTES_V1.HOME, { replace: true });
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to select organization');
    } finally {
      setLoadingOrgId(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontFamily: 'Gelasio, serif' }}>
        Select organization
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {orgs.length === 0 ? (
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You are not in any organization yet. Ask an admin to add you, or log
            out to use another account.
          </Typography>
          <A2ZButton variant="outlined" onClick={() => logout()}>
            Log out
          </A2ZButton>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: '100%',
            maxWidth: 400,
          }}
        >
          {orgs.map(({ org_id, name, role }) => (
            <Card key={org_id} variant="outlined">
              <CardActionArea
                onClick={() => handleSelectOrg(org_id)}
                disabled={loadingOrgId !== null}
                sx={{ p: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography fontWeight={500}>{name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role}
                  </Typography>
                </Box>
                {loadingOrgId === org_id && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                    Selecting…
                  </Typography>
                )}
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
