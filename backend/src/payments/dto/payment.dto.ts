import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaymentMethod, PaymentCategory } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: 'O\'quvchi IDsi (agar o\'quvchi to\'lovi bo\'lsa)' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Mijoz IDsi (agar CRM mijoz to\'lovi bo\'lsa)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Bog\'langan hisob-faktura (Invoice) IDsi' })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'Kassa (Cashbox) IDsi' })
  @IsString()
  @IsOptional()
  cashboxId?: string;

  @ApiProperty({ description: 'To\'lov summasi (UZS)', example: 850000, minimum: 1 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'To\'lov usuli', enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod = PaymentMethod.CASH;

  @ApiPropertyOptional({ description: 'To\'lov toifasi', enum: PaymentCategory, default: PaymentCategory.TUITION })
  @IsEnum(PaymentCategory)
  @IsOptional()
  category?: PaymentCategory = PaymentCategory.TUITION;

  @ApiPropertyOptional({ description: 'Shartnoma IDsi' })
  @IsString()
  @IsOptional()
  contractId?: string;

  @ApiPropertyOptional({ description: 'Filial IDsi' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'To\'lov sanasi', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'To\'lov bo\'yicha izoh', example: 'Sentyabr oyi o\'qish to\'lovi' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  notes?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class QueryPaymentDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'O\'quvchi IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Mijoz IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'To\'lov usuli bo\'yicha filter', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'To\'lov toifasi bo\'yicha filter', enum: PaymentCategory })
  @IsEnum(PaymentCategory)
  @IsOptional()
  category?: PaymentCategory;

  @ApiPropertyOptional({ description: 'Filial IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Kassa IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  cashboxId?: string;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Tugash sanasi', example: '2026-09-30' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}

export class VoidPaymentDto {
  @ApiPropertyOptional({ description: 'To\'lovni bekor qilish (Void) sababi', example: 'Xato kiritilgan summa' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reason?: string;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Pulni qaytarish (Refund) sababi', example: 'Mijoz kursni to\'xtatdi' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  reason?: string;

  @ApiPropertyOptional({ description: 'Qaytariladigan aniq summa (agar to\'liq summa bo\'lmasa)' })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Pul qaytariladigan kassa IDsi' })
  @IsString()
  @IsOptional()
  cashboxId?: string;
}
