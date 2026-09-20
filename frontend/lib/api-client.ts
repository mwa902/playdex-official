// ─── Shared error class ──────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    const msg =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${status}: ${statusText}`;
    super(msg);
    this.name = 'ApiError';
  }
  get isNotFound()   { return this.status === 404; }
  get isConflict()   { return this.status === 409; }
  get isBadRequest() { return this.status === 400; }
  get isUnauth()     { return this.status === 401; }
  get isServerError(){ return this.status >= 500; }
}

// ─── Domain types (match backend interfaces exactly) ─────────────────────────
export type UserRole = 'superadmin' | 'admin' | 'user' | 'Event Organization';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: 'Active' | 'Not-Active';
}

export interface EventRecord {
  id: string;
  organization_id: string;
  venue_id: string;
  event_type_id: string;
  name: string;
  description: string;
  started_at: string;
  ended_at: string;
  capacity: number;
  status: 'Available' | 'Not-Available';
  created_at: string;
  updated_at: string;
}

export interface VenueRecord {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface BookingRecord {
  id: string;
  event_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: number;
  status: 'Pending' | 'Confirm Booking' | 'Cancelled';
  booked_at: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRecord {
  id: string;
  company_name: string;
  description: string | null;
  phone_no: string;
  created_at: string;
  updated_at: string;
}

export interface EventTypeRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Create/Update DTOs ───────────────────────────────────────────────────────
export interface CreateEventDto {
  organization_id: string;
  venue_id: string;
  event_type_id: string;
  name: string;
  description: string;
  started_at: string;
  ended_at: string;
  capacity: number;
  status?: 'Available' | 'Not-Available';
}

export interface CreateVenueDto {
  organization_id: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  capacity: number;
}

export interface CreateBookingDto {
  event_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: number;
  status?: 'Pending' | 'Confirm Booking' | 'Cancelled';
}

export interface CreateOrganizationDto {
  company_name: string;
  description?: string;
  phone_no: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// ─── HTTP kernel ─────────────────────────────────────────────────────────────
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
  } catch (err) {
    throw new ApiError(0, 'Network error — is the backend running?', err);
  }

  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  try { return (await res.json()) as T; } catch { return undefined as T; }
}

// ─── API surface ─────────────────────────────────────────────────────────────
export const api = {
  // Auth (handled via cookie-session on backend; backend exposes /users)
  // We simulate login by finding user by email+password from /users list
  loginUser: (email: string, password: string) =>
    req<User[]>('/users').then(users => {
      const u = (users as (User & { password?: string })[])
        .find(x => x.email === email && (x as { password?: string }).password === password);
      if (!u) throw new ApiError(401, 'Unauthorized', { message: 'Invalid email or password.' });
      return u as User;
    }),

  // Users
  listUsers:   () => req<User[]>('/users'),
  getUser:     (id: string) => req<User>(`/users/${id}`),
  createUser:  (dto: CreateUserDto) =>
    req<User>('/users', { method: 'POST', body: JSON.stringify(dto) }),
  updateUser:  (id: string, dto: Partial<CreateUserDto>) =>
    req<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteUser:  (id: string) =>
    req<{ deleted: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  // Events
  listEvents:   () => req<EventRecord[]>('/events'),
  getEvent:     (id: string) => req<EventRecord>(`/events/${id}`),
  createEvent:  (dto: CreateEventDto) =>
    req<EventRecord>('/events', { method: 'POST', body: JSON.stringify(dto) }),
  updateEvent:  (id: string, dto: Partial<CreateEventDto>) =>
    req<EventRecord>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteEvent:  (id: string) =>
    req<{ deleted: boolean }>(`/events/${id}`, { method: 'DELETE' }),

  // Venues
  listVenues:   () => req<VenueRecord[]>('/venues'),
  getVenue:     (id: string) => req<VenueRecord>(`/venues/${id}`),
  createVenue:  (dto: CreateVenueDto) =>
    req<VenueRecord>('/venues', { method: 'POST', body: JSON.stringify(dto) }),
  updateVenue:  (id: string, dto: Partial<CreateVenueDto>) =>
    req<VenueRecord>(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteVenue:  (id: string) =>
    req<{ deleted: boolean }>(`/venues/${id}`, { method: 'DELETE' }),

  // Bookings
  listBookings:   () => req<BookingRecord[]>('/bookings'),
  getBooking:     (id: string) => req<BookingRecord>(`/bookings/${id}`),
  createBooking:  (dto: CreateBookingDto) =>
    req<BookingRecord>('/bookings', { method: 'POST', body: JSON.stringify(dto) }),
  updateBooking:  (id: string, dto: Partial<CreateBookingDto>) =>
    req<BookingRecord>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteBooking:  (id: string) =>
    req<{ deleted: boolean }>(`/bookings/${id}`, { method: 'DELETE' }),

  // Organizations
  listOrganizations:  () => req<OrganizationRecord[]>('/organization'),
  getOrganization:    (id: string) => req<OrganizationRecord>(`/organization/${id}`),
  createOrganization: (dto: CreateOrganizationDto) =>
    req<OrganizationRecord>('/organization', { method: 'POST', body: JSON.stringify(dto) }),
  updateOrganization: (id: string, dto: Partial<CreateOrganizationDto>) =>
    req<OrganizationRecord>(`/organization/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
  deleteOrganization: (id: string) =>
    req<{ deleted: boolean }>(`/organization/${id}`, { method: 'DELETE' }),

  // Event Types
  listEventTypes:  () => req<EventTypeRecord[]>('/event-types'),
  getEventType:    (id: string) => req<EventTypeRecord>(`/event-types/${id}`),
  createEventType: (dto: { name: string; description?: string }) =>
    req<EventTypeRecord>('/event-types', { method: 'POST', body: JSON.stringify(dto) }),
  updateEventType: (id: string, dto: { name?: string; description?: string }) =>
    req<EventTypeRecord>(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteEventType: (id: string) =>
    req<{ deleted: boolean }>(`/event-types/${id}`, { method: 'DELETE' }),
};
