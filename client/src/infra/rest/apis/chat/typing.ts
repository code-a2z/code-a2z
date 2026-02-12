import { USER_PERSONAL_LIMITED_INFO } from '../../typings';

export interface OnlineUser {
  _id: string;
  personal_info: USER_PERSONAL_LIMITED_INFO;
}
