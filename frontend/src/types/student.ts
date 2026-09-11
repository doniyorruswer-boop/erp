/**
 * Student domain types and interfaces
 */

export type StudentStatus = "Faol" | "Nofaol" | "Arxiv" | "ACTIVE" | "INACTIVE";
export type StudentStage = "O'quvchi" | "Bitiruvchi" | "Ketgan" | "Sinovda";
export type StudentGender = "Erkak" | "Ayol" | "MALE" | "FEMALE";

export interface StudentEnrollment {
  id: string;
  group?: {
    id?: string;
    name: string;
  };
}

export interface Student {
  id: string;
  studentId?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  className?: string;
  stage?: StudentStage | string;
  phone: string;
  monthlyFee?: number;
  debt?: number;
  balance?: number;
  address?: string;
  enrollments?: StudentEnrollment[];
  parentName?: string;
  parentPhone?: string;
  createdAt: string;
  status: StudentStatus | string;
  gender?: StudentGender | string;
  birthDate?: string;
  syncedWithBackend?: boolean;
}

export interface StudentFilterParams {
  searchQuery?: string;
  className?: string;
  stage?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateStudentPayload {
  fullName: string;
  phone: string;
  className?: string;
  stage?: string;
  monthlyFee?: number;
  debt?: number;
  parentName?: string;
  parentPhone?: string;
  gender?: string;
  birthDate?: string;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {
  id: string;
}
