export type ScheduleKind = "GROUP_CLASS" | "APPOINTMENT";

export type ScheduleStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM";

export interface ScheduleItem {
  id: string;
  organizationId: string;
  branchId?: string | null;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  resourceId?: string | null;
  instructorId?: string | null;
  groupId?: string | null;
  studentId?: string | null;
  recurrence: RecurrenceType;
  recurrenceRule?: Record<string, unknown> | null;
  kind: ScheduleKind;
  status: ScheduleStatus;
  cancelReason?: string | null;
  customFields?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  resource?: {
    id: string;
    name: string;
    capacity?: number | null;
  } | null;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  group?: {
    id: string;
    name: string;
  } | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  } | null;
}

export interface CreateSchedulePayload {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  resourceId?: string;
  instructorId?: string;
  groupId?: string;
  studentId?: string;
  recurrence?: RecurrenceType;
  recurrenceRule?: Record<string, unknown>;
  kind?: ScheduleKind;
  status?: ScheduleStatus;
  customFields?: Record<string, unknown>;
  branchId?: string;
  force?: boolean;
}

export interface UpdateSchedulePayload {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  resourceId?: string;
  instructorId?: string;
  groupId?: string;
  studentId?: string;
  recurrence?: RecurrenceType;
  recurrenceRule?: Record<string, unknown>;
  kind?: ScheduleKind;
  status?: ScheduleStatus;
  customFields?: Record<string, unknown>;
  branchId?: string;
  force?: boolean;
}

export interface ScheduleQueryParams {
  startDate?: string;
  endDate?: string;
  resourceId?: string;
  instructorId?: string;
  groupId?: string;
  studentId?: string;
  kind?: ScheduleKind;
  status?: ScheduleStatus;
  branchId?: string;
}

export interface CheckConflictPayload {
  startAt: string;
  endAt: string;
  resourceId?: string;
  instructorId?: string;
  kind?: ScheduleKind;
  excludeScheduleId?: string;
  branchId?: string;
}

export interface CancelSchedulePayload {
  cancelReason: string;
}

export interface ReschedulePayload {
  startAt: string;
  endAt: string;
  force?: boolean;
}
