import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LessonDays, GroupStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateGroupDto {
  @ApiProperty({ description: 'Guruh nomi', example: 'IELTS-Morning-01' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ description: 'Kurs IDsi' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: 'Filial IDsi' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'O\'qituvchi / Murabbiy User IDsi' })
  @IsString()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Xona IDsi' })
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Dars kunlari', enum: LessonDays, default: LessonDays.ODD_DAYS })
  @IsEnum(LessonDays)
  @IsOptional()
  days?: LessonDays = LessonDays.ODD_DAYS;

  @ApiProperty({ description: 'Dars boshlanish vaqti (HH:mm)', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  startTime: string;

  @ApiProperty({ description: 'Dars tugash vaqti (HH:mm)', example: '11:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  endTime: string;

  @ApiPropertyOptional({ description: 'Guruh o\'qishi boshlanadigan sana', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Guruh o\'qishi tugaydigan sana', example: '2027-02-28' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Guruh holati', enum: GroupStatus, default: GroupStatus.PLANNING })
  @IsEnum(GroupStatus)
  @IsOptional()
  status?: GroupStatus;

  @ApiPropertyOptional({ description: 'Dinamik maydonlar', type: Object })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}

export class QueryGroupDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Kurs IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'O\'qituvchi IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'Filial IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Xona IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Guruh holati bo\'yicha filter', enum: GroupStatus })
  @IsEnum(GroupStatus)
  @IsOptional()
  status?: GroupStatus;

  @ApiPropertyOptional({ description: 'Dars kunlari bo\'yicha filter', enum: LessonDays })
  @IsEnum(LessonDays)
  @IsOptional()
  days?: LessonDays;
}
