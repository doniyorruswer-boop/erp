import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateContractDto {
  @ApiProperty({ description: 'O\'quvchi IDsi' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: 'Shartnoma raqami (agar ko\'rsatilmasa avtomatik generatsiya qilinadi)', example: 'SH-2026-0089' })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  contractNumber?: string;

  @ApiProperty({ description: 'Shartnomaning umumiy summasi (UZS)', example: 4500000, minimum: 0 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Chegirma summasi (UZS)', example: 500000, default: 0, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number = 0;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Tugash sanasi', example: '2027-05-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Shartnoma holati', example: 'ACTIVE', default: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filial IDsi' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Qo\'shimcha izoh yoki shartlar' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateContractDto extends PartialType(CreateContractDto) {}

export class QueryContractDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filial IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'O\'quvchi IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Holati bo\'yicha filter (masalan: ACTIVE, COMPLETED, CANCELLED)' })
  @IsString()
  @IsOptional()
  status?: string;
}
