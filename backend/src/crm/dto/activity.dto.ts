import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ActivityType } from "@prisma/client";

export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class QueryActivityDto {
  @IsEnum(ActivityType)
  @IsOptional()
  type?: ActivityType;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
