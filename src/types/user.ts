export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  force_pwd_change: boolean;
}
