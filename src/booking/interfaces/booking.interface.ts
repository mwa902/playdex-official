export interface Booking {
    id: string;
    event_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    seats: number;
    status: 'Pending' | 'Confirm Booking' | 'Cancelled';
    booked_at: Date;
    created_at: Date;
    updated_at: Date;
}