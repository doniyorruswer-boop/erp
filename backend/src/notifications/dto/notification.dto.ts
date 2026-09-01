import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsBoolean } from 'class-validator';
import { NotificationChannel, NotificationStatus } from '@prisma/client';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @IsString()
  @IsOptional()
  event?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SendEventNotificationDto {
  @IsString()
  @IsNotEmpty()
  event: string; // e.g. PAYMENT_RECEIVED, INVOICE_OVERDUE, ATTENDANCE_ABSENT, LESSON_REMINDER, EXAM_REMINDER

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @IsArray()
  @IsOptional()
  channels?: NotificationChannel[];

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class QueryNotificationDto {
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;
}

export class CreateNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @IsString()
  @IsNotEmpty()
  titleTemplate: string;

  @IsString()
  @IsNotEmpty()
  bodyTemplate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateNotificationTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  titleTemplate?: string;

  @IsString()
  @IsOptional()
  bodyTemplate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
