
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({
  collection: 'subscribers',
  timestamps: { createdAt: 'joinedAt' },
})
export class Subscriber {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ default: true })
  is_subscribed!: boolean;

  @Prop({ type: Date, default: Date.now })
  subscribed_at!: Date;

  @Prop({ type: Date, default: null })
  unsubscribed_at!: Date | null;
}

export type SubscriberDocument = HydratedDocument<Subscriber>;

export const SubscriberSchema =
  SchemaFactory.createForClass(Subscriber);
