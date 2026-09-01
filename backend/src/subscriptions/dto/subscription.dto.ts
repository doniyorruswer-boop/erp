import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { SubscriptionStatus, BillingPeriod } from '@prisma/client';

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  planCode: string;

  @IsEnum(BillingPeriod)
  @IsOptional()
  billingPeriod?: BillingPeriod;
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  monthlyPrice: number;

  @IsNumber()
  annualPrice: number;

  @IsArray()
  @IsOptional()
  features?: { featureCode: string; isEnabled?: boolean }[];

  @IsArray()
  @IsOptional()
  limits?: { limitCode: string; value: number }[];
}

export class CheckLimitDto {
  @IsString()
  @IsNotEmpty()
  limitCode: string;

  @IsNumber()
  @IsOptional()
  incrementBy?: number;
}
