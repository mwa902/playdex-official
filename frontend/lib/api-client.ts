// ─── Shared error class ──────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    const msg =
      status === 0
        ? 'Backend unreachable — make sure the server is running on port 5000.'
        : typeof body === 'object' && body !== null && 'message' in body
        ? (() => {
            const m = (body as { message: unknown }).message;
            if (Array.isArray(m)) return m.join(', ');
            return String(m);
          })()
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
export type UserRole = 'superadmin' | 'admin' | 'Admin' | 'user' | 'organization' | 'Event Organization';

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
  price: number | null;
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
  sport_type: string;        // 'Arena' | 'Gym' | 'Pool'
  phone: string | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Public arena-finder helpers ─────────────────────────────────────────────
export type SportTypeFilter = 'All' | 'Arena' | 'Gym' | 'Pool';

/** Client-side filter — no extra endpoint needed (all venues come from /venues) */
export function filterVenues(
  venues: VenueRecord[],
  search: string,
  sport: SportTypeFilter,
): VenueRecord[] {
  const q = search.trim().toLowerCase();
  return venues.filter((v) => {
    const matchSport = sport === 'All' || v.sport_type === sport;
    const matchSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.address.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      (v.description ?? '').toLowerCase().includes(q);
    return matchSport && matchSearch;
  });
}

export interface BookingRecord {
  id: string;
  event_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: number;
  status: 'Pending' | 'Confirm Booking' | 'Cancelled';
  payment_method: string | null;
  payment_slip?: string | null;
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
  price?: number;
}

export interface CreateVenueDto {
  organization_id: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  capacity: number;
  sport_type?: string;
  phone?: string;
  google_maps_url?: string;
}

export interface CreateBookingDto {
  event_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: number;
  status?: 'Pending' | 'Confirm Booking' | 'Cancelled';
  payment_method?: string;
  payment_slip?: string | null;
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
// Local dev  → calls backend directly on http://localhost:5000
// Production → calls /api/* which Vercel rewrites to the deployed backend
//              (NEXT_PUBLIC_API_BASE_URL is empty on Vercel → uses /api prefix)
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
const isLocalhost = RAW_BASE.includes('localhost') || RAW_BASE.includes('127.0.0.1');
// On Vercel RAW_BASE will be set to the backend URL via env var.
// Fallback: use relative /api so the Next.js rewrite proxy handles it.
const BASE = RAW_BASE || '/api';

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      // Always omit credentials — we don't use cookies for auth, only localStorage
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
  } catch (err) {
    throw new ApiError(0, 'Network error — backend unreachable', err);
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
  // Auth — calls POST /users/login on the server
  // Falls back to local demo accounts when server is unreachable (offline demo mode)
  loginUser: async (email: string, password: string): Promise<User> => {
    const DEMO_USERS: User[] = [
      { id: 'demo-superadmin-1', name: 'Super Admin',    email: 'superadmin@playdex.io', role: 'superadmin', is_active: 'Active' },
      { id: 'demo-admin-1',      name: 'Platform Admin', email: 'admin@playdex.io',       role: 'admin',      is_active: 'Active' },
    ];
    const DEMO_PASSWORDS: Record<string, string> = {
      'superadmin@playdex.io': 'SuperAdmin@2024',
      'admin@playdex.io':      'Admin@2024',
    };

    try {
      return await req<User>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      // Backend unreachable → fall back to local demo credentials
      if (err instanceof ApiError && err.status === 0) {
        const demo = DEMO_USERS.find(u => u.email === email);
        if (demo && DEMO_PASSWORDS[email] === password) return demo;
        throw new ApiError(401, 'Unauthorized', { message: 'Invalid email or password.' });
      }
      throw err;
    }
  },

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
  listBookings:        () => req<BookingRecord[]>('/bookings'),
  listBookingsByEvent: (eventId: string) => req<BookingRecord[]>(`/bookings/event/${eventId}`),
  getBooking:          (id: string) => req<BookingRecord>(`/bookings/${id}`),
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
