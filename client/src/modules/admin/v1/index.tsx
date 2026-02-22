import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization,
  PendingOrganization,
} from '../../../infra/rest/apis/admin';
import { useNotifications } from '../../../shared/hooks/use-notification';
import { getFullDay } from '../../../shared/utils/date';

export default function AdminPage() {
  const [list, setList] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await getPendingOrganizations();
      if (res.status === 'success' && res.data?.organizations) {
        setList(res.data.organizations);
      } else {
        setList([]);
      }
    } catch {
      setList([]);
      addNotification({
        message: 'Failed to load pending organizations',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
  }, []);

  const handleApprove = async (orgId: string) => {
    setActingId(orgId);
    try {
      const res = await approveOrganization(orgId);
      if (res.status === 'success') {
        addNotification({
          message: res.message ?? 'Approved',
          type: 'success',
        });
        setList(prev => prev.filter(o => o._id !== orgId));
      } else {
        addNotification({
          message: res.message ?? 'Approve failed',
          type: 'error',
        });
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Approve failed';
      addNotification({ message: msg, type: 'error' });
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (orgId: string) => {
    setActingId(orgId);
    try {
      const res = await rejectOrganization(orgId);
      if (res.status === 'success') {
        addNotification({
          message: res.message ?? 'Rejected',
          type: 'success',
        });
        setList(prev => prev.filter(o => o._id !== orgId));
      } else {
        addNotification({
          message: res.message ?? 'Reject failed',
          type: 'error',
        });
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Reject failed';
      addNotification({ message: msg, type: 'error' });
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pending organizations
      </Typography>
      {list.length === 0 ? (
        <Typography color="text.secondary">
          No pending organization requests.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Requested by (email)</TableCell>
                <TableCell>Requested by (name)</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(row => (
                <TableRow key={row._id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.slug}</TableCell>
                  <TableCell>{row.requested_by_email}</TableCell>
                  <TableCell>{row.requested_by_name ?? '—'}</TableCell>
                  <TableCell>
                    {row.createdAt ? getFullDay(row.createdAt) : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      onClick={() => void handleApprove(row._id)}
                      disabled={actingId !== null}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => void handleReject(row._id)}
                      disabled={actingId !== null}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
