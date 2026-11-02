import { Module } from '@nestjs/common';
import { OrganizationMembersRepository } from './organization-members.repository.js';
import { OrganizationsRepository } from './organizations.repository.js';

@Module({
  providers: [OrganizationsRepository, OrganizationMembersRepository],
  exports: [OrganizationsRepository, OrganizationMembersRepository],
})
export class OrganizationsModule {}
