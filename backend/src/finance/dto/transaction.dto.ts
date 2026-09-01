import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class QueryTransactionDto {
  @IsString()
  @IsOptional()
  cashboxId?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
