
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

const ORGANIZATION_STATUSES = ['pending', 'active', 'suspended'];

const FEATURE_LIST = [
  'articles',
  'chats',
  'notes',
  'code',
  'collaboration',
  'notifications',
  'feedback',
];

@Schema({ collection: 'organizations', timestamps: true }) // enables mongodb collection and enables automatic stamps.
export class Organization {
  @Prop({ required: true, trim: true, maxlength: 120 }) // defines field and rules.
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  })
  slug!: string;

  @Prop({
    type: String,
    enum: ORGANIZATION_STATUSES,
    default: 'pending',
  })
  status!: string;

  @Prop({ trim: true, lowercase: true })
  requested_by_email?: string;

  @Prop({ trim: true })
  requested_by_name?: string;

  @Prop({
    type: [{ type: String, enum: FEATURE_LIST }],
    default: () => [...FEATURE_LIST],
  })
  enabled_features!: string[];
}

export type OrganizationDocument = HydratedDocument<Organization>;

export const OrganizationSchema =
  SchemaFactory.createForClass(Organization); //converts ts class into mongodb schema.

OrganizationSchema.index({ status: 1 }); //create indexes for fster searchesn and preventing duplicate pending requests.

OrganizationSchema.index(
  { requested_by_email: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
);
