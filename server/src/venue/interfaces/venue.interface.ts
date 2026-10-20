export interface Venue {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  capacity: number;
  sport_type: string;
  phone: string | null;
  google_maps_url: string | null;
  created_at: Date;
  updated_at: Date;
}
