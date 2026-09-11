/**
 * User & Staff Domain Types and Interfaces
 */

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

export interface TeacherOption {
  value: string;
  label: string;
}
