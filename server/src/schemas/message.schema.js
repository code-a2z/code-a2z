import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db.js';

const MESSAGE_SCHEMA = Schema(
  {
    sender_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
      index: true,
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: [5000, 'Message should not be more than 5000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of conversations
MESSAGE_SCHEMA.index({ sender_id: 1, receiver_id: 1, createdAt: -1 });
MESSAGE_SCHEMA.index({ receiver_id: 1, sender_id: 1, createdAt: -1 });

export default MESSAGE_SCHEMA;
