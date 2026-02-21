import { FormEvent, useState } from 'react';
import { emailRegex } from '../../../../../../shared/utils/regex';
import { useNotifications } from '../../../../../../shared/hooks/use-notification';
import { inviteMember } from '../../../../../../infra/rest/apis/organization';
import { ErrorResponse } from '../../../../../../infra/rest/typings';

export function useInviteForm() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(null);
    const form = e.currentTarget;
    if (!form) return;
    const formData = new FormData(form);
    const email = (formData.get('email') as string)?.trim() ?? '';
    const role = (formData.get('role') as string) ?? 'member';

    if (!email) {
      addNotification({ message: 'Email is required', type: 'error' });
      return;
    }
    if (!emailRegex.test(email)) {
      addNotification({ message: 'Invalid email format', type: 'error' });
      return;
    }
    if (!['admin', 'member', 'viewer'].includes(role)) {
      addNotification({ message: 'Invalid role', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await inviteMember({ email, role });
      if (response.status === 'success' && response.data) {
        addNotification({
          message: response.message ?? 'Invite sent.',
          type: 'success',
        });
        setSuccessMessage(
          `Invite sent to ${response.data.email} as ${response.data.role}.`
        );
        form.reset();
      } else {
        addNotification({
          message: response.message ?? 'Failed to send invite',
          type: 'error',
        });
      }
    } catch (err) {
      const e = err as ErrorResponse;
      const message =
        e?.response?.data?.message ?? 'Failed to send invite. Try again.';
      addNotification({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { loading, successMessage, handleSubmit };
}
