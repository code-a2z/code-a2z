
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Schema as MongooseSchema,
  Types,
  type HydratedDocument,
} from 'mongoose';

const ORG_MEMBER_ROLES = ['owner', 'admin', 'member', 'viewer'];

@Schema({
  collection: 'organization_members',
  timestamps: true,
})
export class OrganizationMember {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  })
  user_id!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'organizations',
    required: true,
    index: true,
  })
  org_id!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ORG_MEMBER_ROLES,
  })
  role!: string;
}

export type OrganizationMemberDocument =
  HydratedDocument<OrganizationMember>;

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);

OrganizationMemberSchema.index(
  { user_id: 1, org_id: 1 },
  { unique: true },
);
