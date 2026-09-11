/**
 * Course and Group domain types and interfaces
 */

export interface Course {
  id: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  durationMonths?: number;
  lessonDurationMinutes?: number;
  color?: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED" | string;
  groupsCount?: number;
  studentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  course?: Course;
  teacherId?: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  capacity?: number;
  studentCount?: number;
  status: "ACTIVE" | "COMPLETED" | "UPCOMING" | string;
  createdAt?: string;
}

export interface Lesson {
  id: string;
  groupId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  status?: string;
}

export interface CreateCourseDto {
  name: string;
  price: number;
  description?: string;
  durationMonths?: number;
  status?: string;
}
