import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
} from "class-validator";
import { CustomFieldType } from "@prisma/client";

export class CreateFieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(CustomFieldType)
  fieldType: CustomFieldType;

  @IsOptional()
  options?: unknown;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  fieldGroup?: string;
}

export class UpdateFieldDefinitionDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsEnum(CustomFieldType)
  @IsOptional()
  fieldType?: CustomFieldType;

  @IsOptional()
  options?: unknown;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  fieldGroup?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryFieldDefinitionDto {
  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  fieldGroup?: string;
}

export class ValidateCustomFieldsDto {
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @IsNotEmpty()
  values: Record<string, any>;
}
