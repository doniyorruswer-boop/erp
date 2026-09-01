import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateExamDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Imtihon nomi / sarlavhasi', example: 'Midterm Exam Unit 1-4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ description: 'Imtihon o\'tkaziladigan sana', example: '2026-09-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Maksimal ball', example: 100, default: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxScore?: number = 100;
}

export class UpdateExamDto extends PartialType(CreateExamDto) {}

export class QueryExamDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Guruh IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  groupId?: string;
}

export class GradeItemDto {
  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'To\'plangan ball', example: 85.5, minimum: 0 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'O\'qituvchi izohi / fidbek' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  feedback?: string;
}

export class RecordGradesDto {
  @ApiPropertyOptional({ description: 'Imtihon IDsi (agar imtihon bahosi bo\'lsa)' })
  @IsString()
  @IsOptional()
  examId?: string;

  @ApiPropertyOptional({ description: 'Dars IDsi (agar darsdagi baho bo\'lsa)' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiPropertyOptional({ description: 'Baholash sanasi', example: '2026-09-15' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ description: 'Baholar ro\'yxati', type: [GradeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeItemDto)
  grades: GradeItemDto[];
}

export class CreateGradeDto {
  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Imtihon IDsi' })
  @IsString()
  @IsOptional()
  examId?: string;

  @ApiPropertyOptional({ description: 'Dars IDsi' })
  @IsString()
  @IsOptional()
  lessonId?: string;

  @ApiProperty({ description: 'To\'plangan ball', example: 90, minimum: 0 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ description: 'Fidbek' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  feedback?: string;

  @ApiPropertyOptional({ description: 'Baholash sanasi', example: '2026-09-15' })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateGradeDto extends PartialType(CreateGradeDto) {}

export class QueryGradeDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'O\'quvchi IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Imtihon IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  examId?: string;

  @ApiPropertyOptional({ description: 'Dars IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  lessonId?: string;
}
