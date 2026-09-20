export type EventStatus = 'Available' | 'Not-Available';

export interface Event {
  id: string;
  organization_id: string;
  venue_id: string;
  event_type_id: string;
  name: string;
  description: string;
  started_at: Date;
  ended_at: Date;
  capacity: number;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;
}
