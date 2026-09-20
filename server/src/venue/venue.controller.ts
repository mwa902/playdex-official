import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@ApiTags('Venues')
@Controller('venues')
export class VenueController {
  constructor(private readonly service: VenueService) {}

  @Get()
  @ApiOperation({ summary: 'List all venues' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue by ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create venue' })
  create(@Body() dto: CreateVenueDto) { return this.service.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update venue' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete venue' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
