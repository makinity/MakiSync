import { UserRole } from '@/lib/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}
