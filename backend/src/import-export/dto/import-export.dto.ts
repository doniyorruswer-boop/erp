import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

export enum ImportEntityType {
  STUDENT = 'STUDENT',
  CUSTOMER = 'CUSTOMER',
  LEAD = 'LEAD',
  PAYMENT = 'PAYMENT',
}

export class PreviewImportDto {
  @IsEnum(ImportEntityType)
  @IsNotEmpty()
  entityType: ImportEntityType;

  @IsArray()
  @IsOptional()
  rows?: Record<string, any>[];

  @IsString()
  @IsOptional()
  csvContent?: string;
}

export class ConfirmImportDto {
  @IsEnum(ImportEntityType)
  @IsNotEmpty()
  entityType: ImportEntityType;

  @IsArray()
  @IsNotEmpty()
  rows: Record<string, any>[];
}

export class ExportQueryDto {
  @IsString()
  @IsOptional()
  format?: 'csv' | 'json';

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
