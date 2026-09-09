import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from "class-validator";
import { ResourceType, ResourceStatus } from "@prisma/client";

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  customFields?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  customFields?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class QueryResourceDto {
  @IsEnum(ResourceType)
  @IsOptional()
  type?: ResourceType;

  @IsEnum(ResourceStatus)
  @IsOptional()
  status?: ResourceStatus;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
