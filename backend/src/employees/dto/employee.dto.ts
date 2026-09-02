import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, Min } from 'class-validator';
import { EmploymentType, SalaryType, EmployeeStatus, PayrollStatus, PaymentMethod } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(SalaryType)
  @IsOptional()
  salaryType?: SalaryType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryEmployeeDto {
  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsString()
  @IsOptional()
  search?: string;
}

export class CreatePayrollDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  period: string; // e.g. "2026-09"

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  bonusAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deductionAmount?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paidVia?: PaymentMethod;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
