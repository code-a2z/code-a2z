import { post, get } from '../..';
import { ApiResponse } from '../../typings';
import { OnlineUser } from './typing';

export const reportPresence = async () => {
  return post<undefined, ApiResponse<undefined>>(
    '/api/chat/presence',
    true,
    undefined
  );
};

export const getOnlineUsers = async () => {
  return get<undefined, ApiResponse<OnlineUser[]>>(
    '/api/chat/online-users',
    true
  );
};
