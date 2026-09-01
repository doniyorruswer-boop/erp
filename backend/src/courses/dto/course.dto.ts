import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateCourseDto {
  @ApiProperty({ description: 'Kurs nomi', example: 'General English IELTS' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ description: 'Kurs tavsifi', example: 'IELTS imtihoniga tayyorlovchi 6 oylik intensiv kurs' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Kurs narxi (UZS)', example: 850000, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Davomiyligi (oylar soni)', example: 6, minimum: 1 })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Umumiy darslar soni (oyiga yoki kurs davomida)', example: 72, minimum: 1 })
  @IsInt()
  @Min(1)
  lessonCount: number;

  @ApiPropertyOptional({ description: 'Kurs faolmi', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Dinamik maydonlar', type: Object })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class QueryCourseDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Faollik holati bo\'yicha filter' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
