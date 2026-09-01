import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateLessonDto {
  @ApiProperty({ description: 'Guruh IDsi' })
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ description: 'Dars mavzusi / sarlavhasi', example: 'Present Perfect vs Past Simple' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Dars o\'tiladigan sana', example: '2026-09-02' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({ description: 'Dars boshlanish vaqti (HH:mm)', example: '09:00' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  startTime?: string;

  @ApiPropertyOptional({ description: 'Dars tugash vaqti (HH:mm)', example: '10:30' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  endTime?: string;

  @ApiPropertyOptional({ description: 'Xona nomi yoki raqami', example: 'Xona 204' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  room?: string;

  @ApiPropertyOptional({ description: 'Batafsil dars rejasi / mavzusi' })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional({ description: 'Uyga vazifa' })
  @IsString()
  @IsOptional()
  homework?: string;

  @ApiPropertyOptional({ description: 'Dars holati (masalan: SCHEDULED, COMPLETED, CANCELLED)', default: 'SCHEDULED' })
  @IsString()
  @IsOptional()
  status?: string = 'SCHEDULED';
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}

export class QueryLessonDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Guruh IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi (Filter)', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Tugash sanasi (Filter)', example: '2026-09-30' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Dars holati bo\'yicha filter' })
  @IsString()
  @IsOptional()
  status?: string;
}
