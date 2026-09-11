import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject } from "class-validator";
import { BusinessType } from "@prisma/client";

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
  features?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  terminology?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  integrations?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  adminFirstName?: string;

  @IsString()
  @IsOptional()
  adminLastName?: string;

  @IsString()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsOptional()
  adminPhone?: string;

  @IsString()
  @IsOptional()
  adminPassword?: string;
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
  features?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  terminology?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  integrations?: Record<string, unknown>;
}
