import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
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
        try {
            return await this.organizationService.runOrganizationMigration();
        } catch (error) {
            if (error instanceof InternalServerErrorException) throw error;
            throw new InternalServerErrorException(`Migration execution failed: ${error.message}`);
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrganizationDto: CreateOrganizationDto): Promise<IOrganization> {
        try {
            return await this.organizationService.create(createOrganizationDto);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException(`Failed to create organization: ${error.message}`);
        }
    }

    @Get()
    async findAll(): Promise<IOrganization[]> {
        try {
            return await this.organizationService.findAll();
        } catch (error) {
            throw new InternalServerErrorException(`Failed to retrieve organizations: ${error.message}`);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IOrganization> {
        try {
            return await this.organizationService.findOne(id);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Failed to fetch organization: ${error.message}`);
        }
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
    ): Promise<IOrganization> {
        try {
            return await this.organizationService.update(id, updateOrganizationDto);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Failed to update organization: ${error.message}`);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
        try {
            return await this.organizationService.remove(id);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Failed to delete organization: ${error.message}`);
        }
    }
}
