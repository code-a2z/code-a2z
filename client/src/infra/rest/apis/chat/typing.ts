import { USER_PERSONAL_LIMITED_INFO } from '../../typings';

export interface OnlineUser {
  _id: string;
  personal_info: USER_PERSONAL_LIMITED_INFO;
  /**
   * Optional status flag used by the chats module.
   * If true, the user is currently online; otherwise they are offline.
   */
  isOnline?: boolean;
}
