
import { Mongoose, Types } from 'mongoose';
import {
  SetPasswordToken,
  SetPasswordTokenSchema,
} from './set-password-token.schema.js';

describe('SetPasswordTokenSchema', () => {
  const mongoose = new Mongoose();

  const TokenModel = mongoose.model(
    SetPasswordToken.name,
    SetPasswordTokenSchema,
  );

  it('should accept valid token data', () => {
    const token = new TokenModel({
      token: 'sample-test-token',
      email: 'TEST@EXAMPLE.COM',
      org_id: new Types.ObjectId(),
      expires_at: new Date(Date.now() + 3600000),
    });

    expect(token.validateSync()).toBeUndefined();
    expect(token.email).toBe('test@example.com');
  });

  it('should reject missing required fields', () => {
    const token = new TokenModel({});

    const error = token.validateSync();

    expect(error?.errors.token).toBeDefined();
    expect(error?.errors.email).toBeDefined();
    expect(error?.errors.org_id).toBeDefined();
    expect(error?.errors.expires_at).toBeDefined();
  });

  it('should define unique and TTL indexes', () => {
    expect(SetPasswordTokenSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { token: 1 },
          expect.objectContaining({ unique: true }),
        ],
        [
          { expires_at: 1 },
          expect.objectContaining({ expireAfterSeconds: 0 }),
        ],
      ]),
    );
  });
});
