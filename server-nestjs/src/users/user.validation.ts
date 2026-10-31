import {
  readEnum,
  readNumber,
  readObjectId,
  readObjectIdArray,
  readOptionalString,
  readRecord,
  readString,
} from '../database/document-validation.js';
import {
  USER_ROLES,
  type CreateUserInput,
  type User,
  type UserAccountInfo,
  type UserSocialLinks,
} from './types/user.js';

const PROFILE_NAMES = [
  'Garfield',
  'Tinkerbell',
  'Annie',
  'Loki',
  'Cleo',
  'Angel',
  'Bob',
  'Mia',
  'Coco',
  'Gracie',
  'Bear',
  'Bella',
  'Abby',
  'Harley',
  'Cali',
  'Leo',
  'Luna',
  'Jack',
  'Felix',
  'Kiki',
] as const;

const PROFILE_STYLES = [
  'notionists-neutral',
  'adventurer-neutral',
  'fun-emoji',
] as const;

const SOCIAL_LINK_FIELDS = [
  'youtube',
  'instagram',
  'facebook',
  'x',
  'github',
  'linkedin',
  'website',
] as const;

export function generateProfileImage(
  random: () => number = Math.random,
): string {
  const style = PROFILE_STYLES[Math.floor(random() * PROFILE_STYLES.length)];
  const name = PROFILE_NAMES[Math.floor(random() * PROFILE_NAMES.length)];

  return `https://api.dicebear.com/6.x/${style}/svg?seed=${name}`;
}

export function prepareUser(
  input: CreateUserInput,
  now: Date = new Date(),
): User {
  const user = readRecord(input, 'user');
  const personalInfo = readRecord(user.personal_info, 'personal_info');
  const socialLinks = readOptionalRecord(user.social_links, 'social_links');
  const accountInfo = readOptionalRecord(user.account_info, 'account_info');

  const bio = readOptionalString(personalInfo.bio, 'personal_info.bio', {
    maxLength: 200,
  });
  const profileImage = readOptionalString(
    personalInfo.profile_img,
    'personal_info.profile_img',
  );

  return {
    personal_info: {
      fullname: readString(personalInfo.fullname, 'personal_info.fullname', {
        minLength: 3,
      }),
      subscriber_id: readObjectId(
        personalInfo.subscriber_id,
        'personal_info.subscriber_id',
      ),
      password: readString(personalInfo.password, 'personal_info.password', {
        minLength: 6,
      }),
      username: readString(personalInfo.username, 'personal_info.username', {
        lowercase: true,
        minLength: 3,
      }),
      bio: bio ?? '',
      profile_img: profileImage ?? generateProfileImage(),
    },
    social_links: prepareSocialLinks(socialLinks),
    account_info: prepareAccountInfo(accountInfo),
    role:
      user.role === undefined
        ? 'user'
        : readEnum(user.role, 'role', USER_ROLES),
    project_ids:
      user.project_ids === undefined
        ? []
        : readObjectIdArray(user.project_ids, 'project_ids'),
    collaborated_project_ids:
      user.collaborated_project_ids === undefined
        ? []
        : readObjectIdArray(
            user.collaborated_project_ids,
            'collaborated_project_ids',
          ),
    collection_ids:
      user.collection_ids === undefined
        ? []
        : readObjectIdArray(user.collection_ids, 'collection_ids'),
    joinedAt: new Date(now),
    updatedAt: new Date(now),
  };
}

function readOptionalRecord(
  value: unknown,
  field: string,
): Record<string, unknown> {
  return value === undefined ? {} : readRecord(value, field);
}

function prepareSocialLinks(input: Record<string, unknown>): UserSocialLinks {
  return Object.fromEntries(
    SOCIAL_LINK_FIELDS.map((field) => [
      field,
      readOptionalString(input[field], `social_links.${field}`) ?? '',
    ]),
  ) as unknown as UserSocialLinks;
}

function prepareAccountInfo(input: Record<string, unknown>): UserAccountInfo {
  return {
    total_posts:
      input.total_posts === undefined
        ? 0
        : readNumber(input.total_posts, 'account_info.total_posts'),
    total_reads:
      input.total_reads === undefined
        ? 0
        : readNumber(input.total_reads, 'account_info.total_reads'),
  };
}
