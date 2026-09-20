export type DataState = 'loading' | 'error' | 'empty' | 'data';

export interface EventRecord { id: string; name: string; type: string; venue: string; date: string; capacity: number; status: string; }
export interface VenueRecord { id: string; name: string; city: string; courts: number; availability: string; }
export interface BookingRecord { id: string; participant: string; event: string; created: string; status: string; }
export interface CurrentUser { id: string; name: string; email: string; }
export interface ApiClient {
  getCurrentUser(): Promise<CurrentUser>;
  listEvents(): Promise<EventRecord[]>;
  getEvent(id: string): Promise<EventRecord>;
  listVenues(): Promise<VenueRecord[]>;
  listBookings(): Promise<BookingRecord[]>;
  createAccount(input: { name: string; email: string; password: string }): Promise<CurrentUser>;
  login(input: { email: string; password: string }): Promise<CurrentUser>;
  logout(): Promise<void>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

export const liveClient: ApiClient = {
  getCurrentUser: () => request<CurrentUser>('/users/me'),
  listEvents: () => request<EventRecord[]>('/events'),
  getEvent: (id) => request<EventRecord>(`/events/${id}`),
  listVenues: () => request<VenueRecord[]>('/venues'),
  listBookings: () => request<BookingRecord[]>('/bookings'),
  createAccount: (input) => request<CurrentUser>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input) => request<CurrentUser>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};
