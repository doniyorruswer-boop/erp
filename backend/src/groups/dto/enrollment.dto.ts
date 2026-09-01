import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateGroupEnrollmentDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Guruhga qo\'shilgan sana', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  joinedAt?: string;

  @ApiPropertyOptional({ description: 'A\'zolik faolmi', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateGroupEnrollmentDto extends PartialType(CreateGroupEnrollmentDto) {}

export class QueryGroupEnrollmentDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Guruh IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'O\'quvchi IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Faollik bo\'yicha filter' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
