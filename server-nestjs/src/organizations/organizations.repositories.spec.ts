import { ObjectId } from 'mongodb';
import { DatabaseService } from '../database/database.service.js';
import { DocumentValidationError } from '../database/document-validation.js';
import {
  ORGANIZATION_MEMBER_INDEXES,
  OrganizationMembersRepository,
} from './organization-members.repository.js';
import {
  ORGANIZATION_INDEXES,
  OrganizationsRepository,
} from './organizations.repository.js';
import type { CreateOrganizationInput } from './types/organization.js';
import type { CreateOrganizationMemberInput } from './types/organization-member.js';

describe('native organization repositories', () => {
  const insertedId = new ObjectId();
  const insertOne = vi.fn().mockResolvedValue({ insertedId });
  const createIndexes = vi.fn().mockResolvedValue([]);
  const findOne = vi.fn().mockResolvedValue(null);
  const collection = vi.fn().mockReturnValue({
    createIndexes,
    findOne,
    insertOne,
  });
  const database = {
    getDb: () => ({ collection }),
  } as unknown as DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates every Express organization index on the original collections', async () => {
    await new OrganizationsRepository(database).onApplicationBootstrap();
    expect(collection).toHaveBeenLastCalledWith('organizations');
    expect(createIndexes).toHaveBeenLastCalledWith(ORGANIZATION_INDEXES);

    await new OrganizationMembersRepository(database).onApplicationBootstrap();
    expect(collection).toHaveBeenLastCalledWith('organization_members');
    expect(createIndexes).toHaveBeenLastCalledWith(ORGANIZATION_MEMBER_INDEXES);

    expect(ORGANIZATION_INDEXES).toEqual([
      { key: { slug: 1 }, unique: true },
      { key: { status: 1 } },
      {
        key: { requested_by_email: 1 },
        unique: true,
        partialFilterExpression: { status: 'pending' },
      },
    ]);
    expect(ORGANIZATION_MEMBER_INDEXES).toEqual([
      { key: { user_id: 1 } },
      { key: { org_id: 1 } },
      { key: { user_id: 1, org_id: 1 }, unique: true },
    ]);
  });

  it('normalizes organizations and applies all Express defaults', async () => {
    const repository = new OrganizationsRepository(database);

    const result = await repository.create({
      name: '  Test Organization  ',
      slug: ' TEST-ORG ',
      requested_by_email: ' OWNER@EXAMPLE.COM ',
    });

    expect(insertOne).toHaveBeenCalledWith({
      name: 'Test Organization',
      slug: 'test-org',
      status: 'pending',
      requested_by_email: 'owner@example.com',
      enabled_features: [
        'articles',
        'chats',
        'notes',
        'code',
        'collaboration',
        'notifications',
        'feedback',
      ],
      createdAt: new Date('2026-01-02T03:04:05.000Z'),
      updatedAt: new Date('2026-01-02T03:04:05.000Z'),
    });
    expect(result._id).toBe(insertedId);
  });

  it('allows suspended organizations but rejects rejected status on new writes', async () => {
    const repository = new OrganizationsRepository(database);

    await repository.create({
      name: 'Suspended Organization',
      slug: 'suspended-organization',
      status: 'suspended',
    });

    expect(insertOne).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'suspended' }),
    );

    const rejectedOrganization = {
      name: 'Rejected Organization',
      slug: 'rejected-organization',
      status: 'rejected',
    } as unknown as CreateOrganizationInput;

    await expect(
      repository.create(rejectedOrganization),
    ).rejects.toBeInstanceOf(DocumentValidationError);
    expect(insertOne).toHaveBeenCalledTimes(1);
  });

  it('returns legacy organizations with rejected status', async () => {
    const repository = new OrganizationsRepository(database);
    const legacyOrganization = {
      _id: new ObjectId(),
      name: 'Legacy Organization',
      slug: 'legacy-organization',
      status: 'rejected' as const,
      enabled_features: [],
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
    };
    findOne.mockResolvedValueOnce(legacyOrganization);

    const result = await repository.findBySlug('legacy-organization');

    expect(result).toBe(legacyOrganization);
    expect(result?.status).toBe('rejected');
  });

  it('validates organization members and applies timestamps', async () => {
    const repository = new OrganizationMembersRepository(database);
    const userId = new ObjectId();
    const organizationId = new ObjectId();

    await repository.create({
      user_id: userId,
      org_id: organizationId,
      role: 'owner',
    });

    expect(insertOne).toHaveBeenCalledWith({
      user_id: userId,
      org_id: organizationId,
      role: 'owner',
      createdAt: new Date('2026-01-02T03:04:05.000Z'),
      updatedAt: new Date('2026-01-02T03:04:05.000Z'),
    });

    const invalidMember = {
      user_id: 'not-an-object-id',
      org_id: organizationId,
      role: 'superadmin',
    } as unknown as CreateOrganizationMemberInput;

    await expect(repository.create(invalidMember)).rejects.toBeInstanceOf(
      DocumentValidationError,
    );
  });
});
