// Re-export everything from the canonical api-client module
export { api } from './api-client';
export type {
  User,
  UserRole,
  EventRecord,
  VenueRecord,
  BookingRecord,
  OrganizationRecord,
  EventTypeRecord,
  CreateEventDto,
  CreateVenueDto,
  CreateBookingDto,
  CreateOrganizationDto,
  CreateUserDto,
  ApiError,
} from './api-client';
