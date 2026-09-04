export interface Venue {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    capacity: number;
    created_at: Date;
    updated_at: Date;
}
