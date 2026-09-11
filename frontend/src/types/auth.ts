/**
 * Authentication and User domain types
 */

export type UserRole =
  "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "MENTOR" | "STAFF" | "PARENT" | "GUEST";

export interface Organization {
  id?: string;
  name: string;
  slug: string;
  primaryColor?: string;
  currency?: string;
  businessType?: "SCHOOL" | "COURSE_CENTER" | "KINDERGARTEN";
}

export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
  avatar?: string | null;
  isActive?: boolean;
  organization?: Organization;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  userRole: UserRole | string | null;
  loading: boolean;
  error: string | null;
}
