import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsInt,
    Min,
    IsEnum,
    IsOptional,
    IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';


export enum EventStatus {
    AVAILABLE = 'Available',
    NOT_AVAILABLE = 'Not-Available',
}

export class CreateEventDto {
    @IsNotEmpty()
    @IsUUID('4', { message: 'organization_id must be a valid UUID v4' })
    organization_id: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'venue_id must be a valid UUID v4' })
    venue_id: string;

    @IsNotEmpty()
    @IsUUID('4', { message: 'event_type_id must be a valid UUID v4' })
    event_type_id: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsDateString({}, { message: 'started_at must be a valid ISO8601 date string' })
    started_at: Date;

    @IsNotEmpty()
    @IsDateString({}, { message: 'ended_at must be a valid ISO8601 date string' })
    ended_at: Date;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'capacity must be at least 1' })
    capacity: number;

    @IsOptional()
    @IsEnum(EventStatus, { message: 'status must be either Available or Not-Available' })
    status?: 'Available' | 'Not-Available';
}
