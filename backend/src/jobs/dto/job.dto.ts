import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsNumber } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  payload: Record<string, any>;

  @IsNumber()
  @IsOptional()
  delayMs?: number;

  @IsNumber()
  @IsOptional()
  maxRetries?: number;
}

export class QueryJobDto {
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @IsString()
  @IsOptional()
  type?: string;
}
