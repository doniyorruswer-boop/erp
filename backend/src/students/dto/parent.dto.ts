import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateParentDto {
  @ApiProperty({ description: 'Ota-ona yoki vasiyning to\'liq ismi', example: 'Matlyuba Xolmatova' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ description: 'Telefon raqami', example: '+998901112233' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: 'Qarindoshlik darajasi (masalan: MOTHER, FATHER, GUARDIAN)', example: 'MOTHER' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  relationship?: string;

  @ApiPropertyOptional({ description: 'Asosiy kontakt shaxsmi', default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateParentDto extends PartialType(CreateParentDto) {}

export class QueryParentDto extends PaginationDto {}

export class LinkStudentParentDto {
  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Ota-ona / Vasiy IDsi' })
  @IsString()
  @IsNotEmpty()
  parentId: string;

  @ApiPropertyOptional({ description: 'Qarindoshlik turi (FATHER, MOTHER, GUARDIAN)', example: 'MOTHER' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  relationship?: string;

  @ApiPropertyOptional({ description: 'Ushbu o\'quvchi uchun asosiy vasiymi', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
