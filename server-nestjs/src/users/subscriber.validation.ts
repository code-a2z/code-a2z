import {
  readBoolean,
  readDate,
  readRecord,
  readString,
} from '../database/document-validation.js';
import type { CreateSubscriberInput, Subscriber } from './types/subscriber.js';

export function prepareSubscriber(
  input: CreateSubscriberInput,
  now: Date = new Date(),
): Subscriber {
  const subscriber = readRecord(input, 'subscriber');
  const unsubscribedAt = subscriber.unsubscribed_at;
  const normalizedUnsubscribedAt =
    unsubscribedAt === undefined || unsubscribedAt === null
      ? null
      : readDate(unsubscribedAt, 'unsubscribed_at');

  return {
    email: readString(subscriber.email, 'email'),
    is_subscribed:
      subscriber.is_subscribed === undefined
        ? true
        : readBoolean(subscriber.is_subscribed, 'is_subscribed'),
    subscribed_at:
      subscriber.subscribed_at === undefined
        ? new Date(now)
        : readDate(subscriber.subscribed_at, 'subscribed_at'),
    unsubscribed_at: normalizedUnsubscribedAt,
    joinedAt: new Date(now),
    updatedAt: new Date(now),
  };
}
