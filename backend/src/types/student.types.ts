export type StudentStatus = "ACTIVE" | "INACTIVE" | "TRIAL" | "GRADUATED" | "EXPELLED" | "DROPPED";

export type StudentStage = "LEAD" | "TRIAL" | "ENROLLED" | "STUDENT";

export interface StudentFilterOptions {
  search?: string;
  status?: StudentStatus;
  stage?: StudentStage;
  classId?: string;
  groupId?: string;
  hasDebt?: boolean;
  branchId?: string;
}

export interface StudentStatsSummary {
  total: number;
  active: number;
  withDebt: number;
  totalDebt: number;
}
