
import { Mongoose, Types } from 'mongoose';
import { User, UserSchema } from './user.schema.js';

describe('UserSchema', () => {
  const mongoose = new Mongoose();
  const UserModel = mongoose.model(User.name, UserSchema);

  it('should accept valid user data and apply defaults', () => {
    const user = new UserModel({
      personal_info: {
        fullname: 'Test User',
        subscriber_id: new Types.ObjectId(),
        password: 'sample-hashed-password',
        username: 'TESTUSER',
      },
    });

    expect(user.validateSync()).toBeUndefined();
    expect(user.personal_info.username).toBe('testuser');
    expect(user.role).toBe('user');
    expect(user.account_info.total_posts).toBe(0);
    expect(user.personal_info.profile_img).toContain('dicebear.com');
  });

  it('should reject invalid user data', () => {
    const user = new UserModel({
      personal_info: {
        fullname: 'AB',
        password: '123',
        username: 'xy',
      },
      role: 'superadmin',
    });

    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error?.errors['personal_info.fullname']).toBeDefined();
    expect(error?.errors['personal_info.subscriber_id']).toBeDefined();
    expect(error?.errors['personal_info.password']).toBeDefined();
    expect(error?.errors['personal_info.username']).toBeDefined();
    expect(error?.errors.role).toBeDefined();
  });

  it('should define unique indexes for username and subscriber', () => {
    expect(UserSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { 'personal_info.username': 1 },
          expect.objectContaining({ unique: true }),
        ],
        [
          { 'personal_info.subscriber_id': 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
  });
});
