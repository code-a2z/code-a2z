
import { Mongoose } from 'mongoose';
import {
  Subscriber,
  SubscriberSchema,
} from './subscriber.schema.js';

describe('SubscriberSchema', () => {
  const mongoose = new Mongoose();

  const SubscriberModel = mongoose.model(
    Subscriber.name,
    SubscriberSchema,
  );

  it('should accept a valid email and apply defaults', () => {
    const subscriber = new SubscriberModel({
      email: 'test@example.com',
    });

    expect(subscriber.validateSync()).toBeUndefined();
    expect(subscriber.is_subscribed).toBe(true);
    expect(subscriber.subscribed_at).toBeInstanceOf(Date);
    expect(subscriber.unsubscribed_at).toBeNull();
  });

  it('should reject missing email', () => {
    const subscriber = new SubscriberModel({});

    const error = subscriber.validateSync();

    expect(error?.errors.email).toBeDefined();
  });

  it('should define a unique email index', () => {
    expect(SubscriberSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { email: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
  });
});
