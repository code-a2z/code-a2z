
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import {
  Schema as MongooseSchema,
  Types,
  type HydratedDocument,
} from 'mongoose';

const USER_ROLES = ['user', 'maintainer', 'admin'];

const PROFILE_NAMES = [
  'Garfield', 'Tinkerbell', 'Annie', 'Loki', 'Cleo',
  'Angel', 'Bob', 'Mia', 'Coco', 'Gracie',
  'Bear', 'Bella', 'Abby', 'Harley', 'Cali',
  'Leo', 'Luna', 'Jack', 'Felix', 'Kiki',
];

const PROFILE_STYLES = [
  'notionists-neutral',
  'adventurer-neutral',
  'fun-emoji',
];

function generateProfileImage(): string {
  const style =
    PROFILE_STYLES[Math.floor(Math.random() * PROFILE_STYLES.length)];

  const name =
    PROFILE_NAMES[Math.floor(Math.random() * PROFILE_NAMES.length)];

  return `https://api.dicebear.com/6.x/${style}/svg?seed=${name}`;
}

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'joinedAt' },
})
export class User {
  @Prop(
    raw({
      fullname: {
        type: String,
        required: true,
        minlength: 3,
      },
      subscriber_id: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'subscribers',
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: 3,
      },
      bio: {
        type: String,
        maxlength: 200,
        default: '',
      },
      profile_img: {
        type: String,
        default: generateProfileImage,
      },
    }),
  )
  personal_info!: {
    fullname: string;
    subscriber_id: Types.ObjectId;
    password: string;
    username: string;
    bio: string;
    profile_img: string;
  };

  @Prop(
    raw({
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      x: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    }),
  )
  social_links!: {
    youtube: string;
    instagram: string;
    facebook: string;
    x: string;
    github: string;
    linkedin: string;
    website: string;
  };

  @Prop(
    raw({
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    }),
  )
  account_info!: {
    total_posts: number;
    total_reads: number;
  };

  @Prop({
    type: String,
    enum: USER_ROLES,
    default: 'user',
    required: true,
  })
  role!: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'projects',
    default: [],
  })
  project_ids!: Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'projects',
    default: [],
  })
  collaborated_project_ids!: Types.ObjectId[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'collections',
    default: [],
  })
  collection_ids!: Types.ObjectId[];
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
