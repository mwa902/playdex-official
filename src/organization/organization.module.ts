// src/organization/organization.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database'; // 👈 Explicit workspace monorepo path reference link
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [DatabaseModule], // 👈 Links the token visibility explicitly contextually
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
