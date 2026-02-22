import { FormEvent, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { passwordRegex } from '../../../../shared/utils/regex';
import { useNotifications } from '../../../../shared/hooks/use-notification';
import {
  getSetPasswordInfo,
  postSetPasswordAfterApproval,
} from '../../../../infra/rest/apis/auth';
import { useAuth } from '../../../../shared/hooks/use-auth';
import { useSetAtom } from 'jotai';
import { UserAtom } from '../../../../infra/states/user';
import { setAccessToken } from '../../../../shared/utils/local';
import { ErrorResponse } from '../../../../infra/rest/typings';
import { ROUTE_SELECT_ORG } from '../../../../app/routes/constants/routes';

export function useSetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [orgName, setOrgName] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(!!token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login: authLogin, setOrgsFromLogin } = useAuth();
  const setUser = useSetAtom(UserAtom);
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoadingInfo(false);
      return;
    }
    let cancelled = false;
    getSetPasswordInfo(token)
      .then(res => {
        if (cancelled) return;
        if (res.status === 'success' && res.data?.org_name) {
          setOrgName(res.data.org_name);
          setError(null);
        } else {
          setError(res.message ?? 'Link not found or expired');
        }
      })
      .catch((err: ErrorResponse) => {
        if (cancelled) return;
        const msg = err?.response?.data?.message ?? 'Failed to load link';
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoadingInfo(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      if (!form) return;
      const formData = new FormData(form);
      const fullname = (formData.get('fullname') as string)?.trim() ?? '';
      const password = (formData.get('password') as string) ?? '';
      const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

      if (password !== confirmPassword) {
        addNotification({
          message: 'Passwords do not match',
          type: 'error',
        });
        return;
      }
      if (fullname.length < 3) {
        addNotification({
          message: 'Full name must be at least 3 characters',
          type: 'error',
        });
        return;
      }
      if (!passwordRegex.test(password)) {
        addNotification({
          message:
            'Password must be at least 6 characters and include uppercase, lowercase, and a number',
          type: 'error',
        });
        return;
      }

      const response = await postSetPasswordAfterApproval({
        token,
        password,
        fullname,
      });

      if (response.status !== 'success' || !response.data) {
        addNotification({
          message: response.message ?? 'Set password failed.',
          type: 'error',
        });
        setError(response.message ?? 'Set password failed.');
        return;
      }

      const {
        user: userData,
        orgs: orgsList,
        access_token: accessToken,
      } = response.data;

      addNotification({
        message: 'Password set. Welcome!',
        type: 'success',
      });
      setUser(
        userData
          ? {
              _id: userData.id,
              personal_info: {
                fullname: userData.fullname ?? '',
                username: userData.username ?? '',
                profile_img: userData.profile_img ?? '',
                subscriber_id: '',
                bio: '',
              },
              social_links: {
                youtube: '',
                instagram: '',
                facebook: '',
                x: '',
                github: '',
                linkedin: '',
                website: '',
              },
              account_info: { total_posts: 0, total_reads: 0 },
              role: '',
              project_ids: [],
              collaborated_projects_ids: [],
              collections_ids: [],
              joinedAt: '',
              updatedAt: '',
            }
          : null
      );
      setAccessToken(accessToken || '');
      authLogin(accessToken || '');
      setOrgsFromLogin(orgsList ?? []);
      navigate(ROUTE_SELECT_ORG, { replace: true });
    } catch (err) {
      console.error('Set password error:', err);
      const e = err as ErrorResponse;
      const message =
        e?.response?.data?.message ?? 'An error occurred. Please try again.';
      addNotification({ message, type: 'error' });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    orgName,
    loading,
    loadingInfo,
    error,
    handleSubmit,
  };
}
