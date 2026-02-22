import { FormEvent, useState } from 'react';
import { emailRegex, passwordRegex } from '../../../../shared/utils/regex';
import { useNotifications } from '../../../../shared/hooks/use-notification';
import { login } from '../../../../infra/rest/apis/auth';
import { useAuth } from '../../../../shared/hooks/use-auth';
import { useSetAtom } from 'jotai';
import { UserAtom } from '../../../../infra/states/user';
import { setAccessToken } from '../../../../shared/utils/local';
import { ErrorResponse } from '../../../../infra/rest/typings';
import { useNavigate } from 'react-router-dom';
import { ROUTE_SELECT_ORG } from '../../../../app/routes/constants/routes';

export const useUserAuthForm = () => {
  const { addNotification } = useNotifications();
  const { login: authLogin, setOrgsFromLogin } = useAuth();
  const setUser = useSetAtom(UserAtom);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!e.currentTarget) return;

      const form = new FormData(e.currentTarget);
      const email = (form.get('email') as string) ?? '';
      const password = (form.get('password') as string) ?? '';

      if (!email.length) {
        addNotification({ message: 'Email is required', type: 'error' });
        return;
      }
      if (!emailRegex.test(email)) {
        addNotification({ message: 'Invalid email', type: 'error' });
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

      const response = await login({ email, password });

      if (response.status !== 'success' || !response.data) {
        addNotification({
          message: response.message ?? 'Login failed.',
          type: 'error',
        });
        return;
      }

      const {
        user: userData,
        orgs: orgsList,
        access_token: accessToken,
      } = response.data;

      addNotification({ message: response.message, type: response.status });
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
      navigate(ROUTE_SELECT_ORG);
    } catch (error) {
      console.error('Error in form submission:', error);
      const err = error as ErrorResponse;
      const message =
        err?.response?.data?.message ?? 'An error occurred. Please try again.';
      const status = err?.response?.data?.status ?? 'error';
      addNotification({ message, type: status });
      // On 403 or "not a member of any organization": do NOT setOrgsFromLogin or navigate
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit,
  };
};
