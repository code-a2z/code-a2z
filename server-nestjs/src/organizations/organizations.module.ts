import { Module } from '@nestjs/common';
import { OrganizationMember, OrganizationMemberSchema } from './schemas/organization-member.schema.js';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema.js';

@Module({ //Creates a NestJS module.
  imports: [
    MongooseModule.forFeature([ //forfeature: registers a model so we can use it to read and write MongoDB documents.
      {
        name: Organization.name,
        schema: OrganizationSchema,
      },

      {
        name: OrganizationMember.name,
        schema: OrganizationMemberSchema,
    },

    ]),
  ],
})
export class OrganizationsModule {}