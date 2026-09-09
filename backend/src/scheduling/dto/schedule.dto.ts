import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean } from "class-validator";
import { RecurrenceType, ScheduleKind, ScheduleStatus } from "@prisma/client";

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  instructorId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsOptional()
  recurrenceRule?: Record<string, unknown>;

  @IsEnum(ScheduleKind)
  @IsOptional()
  kind?: ScheduleKind;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;

  @IsString()
  @IsOptional()
  cancelReason?: string;

  @IsOptional()
  customFields?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  instructorId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsEnum(RecurrenceType)
  @IsOptional()
  recurrence?: RecurrenceType;

  @IsOptional()
  recurrenceRule?: Record<string, unknown>;

  @IsEnum(ScheduleKind)
  @IsOptional()
  kind?: ScheduleKind;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;

  @IsString()
  @IsOptional()
  cancelReason?: string;

  @IsOptional()
  customFields?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class QueryScheduleDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  instructorId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsEnum(ScheduleKind)
  @IsOptional()
  kind?: ScheduleKind;

  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class CheckConflictDto {
  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  instructorId?: string;

  @IsEnum(ScheduleKind)
  @IsOptional()
  kind?: ScheduleKind;

  @IsString()
  @IsOptional()
  excludeScheduleId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class CancelScheduleDto {
  @IsString()
  @IsNotEmpty()
  cancelReason: string;
}

export class RescheduleDto {
  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}
