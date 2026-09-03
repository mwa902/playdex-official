import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { IOrganization } from './interfaces/create.organization.interface';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Post('migrate')
    @HttpCode(HttpStatus.OK)
    async migrate(): Promise<{ message: string }> {
        return await this.organizationService.runOrganizationMigration();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<IOrganization> {
        return await this.organizationService.create(createOrganizationDto);
    }

    @Get()
    async findAll(): Promise<IOrganization[]> {
        return await this.organizationService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IOrganization> {
        return await this.organizationService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto
    ): Promise<IOrganization> {
        return await this.organizationService.update(id, updateOrganizationDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        return await this.organizationService.remove(id);
    }
}
