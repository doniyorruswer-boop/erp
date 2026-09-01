import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { BusinessType } from '@prisma/client';

export class InitializeSetupDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(BusinessType)
  @IsNotEmpty()
  businessType: BusinessType;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsArray()
  @IsOptional()
  enabledModules?: string[];

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @IsObject()
  @IsOptional()
  terminology?: Record<string, any>;

  @IsObject()
  @IsOptional()
  integrations?: Record<string, any>;
}

export class UpdateConfigDto {
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @IsArray()
  @IsOptional()
  enabledModules?: string[];

  @IsObject()
  @IsOptional()
  features?: Record<string, any>;

  @IsObject()
  @IsOptional()
  terminology?: Record<string, any>;

  @IsObject()
  @IsOptional()
  integrations?: Record<string, any>;
}
