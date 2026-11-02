// ── User (Django /auth/login/ → response.user) ────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  /** MongoDB ObjectId string — used as `acc_id` in Django API calls */
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
}
