import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ConvertLeadDto {
  @IsBoolean()
  @IsOptional()
  createCustomer?: boolean;

  @IsBoolean()
  @IsOptional()
  createStudent?: boolean;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
