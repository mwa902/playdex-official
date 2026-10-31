export type BookingStatus = 'Pending' | 'Confirm Booking' | 'Cancelled';

export interface Booking {
  id: string;
  event_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  seats: number;
  status: BookingStatus;
  payment_method: string | null;
  payment_slip?: string | null;
  booked_at: Date;
  created_at: Date;
  updated_at: Date;
}
