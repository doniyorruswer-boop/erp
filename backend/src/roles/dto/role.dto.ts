import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionScope } from '@prisma/client';

export class RolePermissionInputDto {
  @IsString()
  @IsNotEmpty()
  permissionCode: string;

  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionInputDto)
  permissions?: RolePermissionInputDto[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionInputDto)
  permissions?: RolePermissionInputDto[];
}
