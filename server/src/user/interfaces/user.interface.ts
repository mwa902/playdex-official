export type UserRole = 'superadmin' | 'admin' | 'user' | 'Event Organization';
export type ActiveStatus = 'Active' | 'Not-Active';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: ActiveStatus;
  created_at: Date;
  updated_at: Date;
}
