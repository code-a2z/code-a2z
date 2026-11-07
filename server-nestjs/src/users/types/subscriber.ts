export interface Subscriber {
  email: string;
  is_subscribed: boolean;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  email_verified_at?: Date | null;
  joinedAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriberInput {
  email: string;
  is_subscribed?: boolean;
  subscribed_at?: Date;
  unsubscribed_at?: Date | null;
}
