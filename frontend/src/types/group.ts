/**
 * Group Domain Types and Interfaces
 */

export interface GroupItem {
  id: string;
  name: string;
  courseId: string;
  course?: {
    id: string;
    name: string;
    price?: number;
  };
  teacherId?: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  roomId?: string;
  room?: {
    id: string;
    name: string;
    capacity?: number;
  };
  days?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  status: "ACTIVE" | "COMPLETED" | "UPCOMING" | string;
  _count?: {
    enrollments?: number;
    lessons?: number;
  };
  createdAt?: string;
}

export interface CreateGroupPayload {
  name: string;
  courseId: string;
  teacherId?: string;
  roomId?: string;
  days?: string;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
}
