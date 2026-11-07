import { IsMongoId } from 'class-validator';

export class SelectOrganizationDto {
  @IsMongoId({ message: 'org_id must be a valid MongoDB ObjectId' })
  org_id!: string;
}
