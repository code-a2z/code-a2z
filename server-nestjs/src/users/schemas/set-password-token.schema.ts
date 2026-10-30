
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Schema as MongooseSchema,
  Types,
  type HydratedDocument,
} from 'mongoose';

@Schema({
  collection: 'set_password_tokens',
  timestamps: true,
})
export class SetPasswordToken {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  token!: string;

  @Prop({
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  })
  email!: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'organizations',
    required: true,
    index: true,
  })
  org_id!: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  expires_at!: Date;
}

export type SetPasswordTokenDocument =
  HydratedDocument<SetPasswordToken>;

export const SetPasswordTokenSchema =
  SchemaFactory.createForClass(SetPasswordToken);

SetPasswordTokenSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 },
);
