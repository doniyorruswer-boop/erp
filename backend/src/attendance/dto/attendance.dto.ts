import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class AttendanceRecordItemDto {
  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Davomat holati', enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Sabab yoki qo\'shimcha izoh' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  comment?: string;
}

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Davomat sanasi (YYYY-MM-DD)', example: '2026-09-02' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ description: 'Bog\'langan dars (Lesson) IDsi' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ description: 'O\'quvchilar davomat ro\'yxati', type: [AttendanceRecordItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records: AttendanceRecordItemDto[];
}

export class SingleAttendanceDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Dars IDsi' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ description: 'Sana (YYYY-MM-DD)', example: '2026-09-02' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Davomat holati', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiPropertyOptional({ description: 'Izoh' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  comment?: string;
}

export class QueryAttendanceDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Sana (YYYY-MM-DD)', example: '2026-09-02' })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

export class QueryMonthlyAttendanceDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Oy va yil (YYYY-MM)', example: '2026-09' })
  @IsString()
  @IsNotEmpty()
  month: string;
}

export class QueryStudentAttendanceDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Guruh IDsi' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Tugash sanasi', example: '2026-09-30' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Holati bo\'yicha filter', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;
}
