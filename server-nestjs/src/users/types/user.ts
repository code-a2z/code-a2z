import type { ObjectId } from 'mongodb';

export const USER_ROLES = ['user', 'maintainer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserPersonalInfo {
  fullname: string;
  subscriber_id: ObjectId;
  password: string;
  username: string;
  bio: string;
  profile_img: string;
}

export interface UserSocialLinks {
  youtube: string;
  instagram: string;
  facebook: string;
  x: string;
  github: string;
  linkedin: string;
  website: string;
}

export interface UserAccountInfo {
  total_posts: number;
  total_reads: number;
}

export interface User {
  personal_info: UserPersonalInfo;
  social_links: UserSocialLinks;
  account_info: UserAccountInfo;
  role: UserRole;
  project_ids: ObjectId[];
  collaborated_project_ids: ObjectId[];
  collection_ids: ObjectId[];
  joinedAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  personal_info: {
    fullname: string;
    subscriber_id: ObjectId;
    password: string;
    username: string;
    bio?: string;
    profile_img?: string;
  };
  social_links?: Partial<UserSocialLinks>;
  account_info?: Partial<UserAccountInfo>;
  role?: UserRole;
  project_ids?: ObjectId[];
  collaborated_project_ids?: ObjectId[];
  collection_ids?: ObjectId[];
}
