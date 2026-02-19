import { Schema } from 'mongoose';

const SUBSCRIBER_SCHEMA = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    is_subscribed: {
      type: Boolean,
      default: true,
    },
    subscribed_at: {
      type: Date,
      default: Date.now,
    },
    unsubscribed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'joinedAt',
    },
  }
);

export default SUBSCRIBER_SCHEMA;
