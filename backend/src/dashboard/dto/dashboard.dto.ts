import { IsString, IsOptional } from 'class-validator';

export class QueryDashboardStatsDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  month?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  range?: string;
}
