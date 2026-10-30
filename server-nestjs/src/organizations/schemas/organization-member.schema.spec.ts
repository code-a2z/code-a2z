
import { Mongoose, Types } from 'mongoose';
import {
  OrganizationMember,
  OrganizationMemberSchema,
} from './organization-member.schema.js';

describe('OrganizationMemberSchema', () => {
  const mongoose = new Mongoose();

  const MemberModel = mongoose.model(
    OrganizationMember.name,
    OrganizationMemberSchema,
  );

  it('should accept valid membership data', () => {
    const member = new MemberModel({
      user_id: new Types.ObjectId(),
      org_id: new Types.ObjectId(),
      role: 'owner',
    });

    expect(member.validateSync()).toBeUndefined();
  });

  it('should reject missing IDs and invalid roles', () => {
    const member = new MemberModel({
      role: 'superadmin',
    });

    const error = member.validateSync();

    expect(error?.errors.user_id).toBeDefined();
    expect(error?.errors.org_id).toBeDefined();
    expect(error?.errors.role).toBeDefined();
  });

  it('should define a unique membership index', () => {
    expect(OrganizationMemberSchema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { user_id: 1, org_id: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
  });
});
