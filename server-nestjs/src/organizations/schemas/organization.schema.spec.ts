
import { Mongoose } from 'mongoose';
import {
  Organization,
  OrganizationSchema,
} from './organization.schema.js';

describe('OrganizationSchema', () => {
  const mongoose = new Mongoose();

  const OrganizationModel = mongoose.model(
    Organization.name,
    OrganizationSchema,
  );

  it('should apply correct default values', () => {
    const org = new OrganizationModel({
      name: 'Test Organization',
      slug: 'TEST-ORG',
    });

    expect(org.slug).toBe('test-org');
    expect(org.status).toBe('pending');
    expect(org.enabled_features).toHaveLength(7);
    expect(org.validateSync()).toBeUndefined();
  });

  it('should reject invalid organization data', () => {
    const org = new OrganizationModel({
      slug: 'test-org',
      status: 'invalid',
    });

    const error = org.validateSync();

    expect(error?.errors.name).toBeDefined();
    expect(error?.errors.status).toBeDefined();
  });

  it('should define the required indexes', () => {
    const indexes = OrganizationSchema.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        [
          { slug: 1 },
          expect.objectContaining({ unique: true }),
        ],
        [
          { requested_by_email: 1 },
          expect.objectContaining({
            unique: true,
            partialFilterExpression: { status: 'pending' },
          }),
        ],
      ]),
    );
  });
});
