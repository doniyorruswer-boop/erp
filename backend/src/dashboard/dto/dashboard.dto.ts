import { IsString, IsOptional } from 'class-validator';

export class QueryDashboardStatsDto {
  @IsString()
  @IsOptional()
  type?: string;
}
