import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { QueryDashboardStatsDto } from './dto/dashboard.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermissions('reports.view')
  getStats(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryDashboardStatsDto,
  ) {
    return this.dashboardService.getStats(
      orgId,
      query.type,
      branchCtx,
      query.month,
      query.year,
      query.startDate,
      query.endDate,
      query.range,
    );
  }

  @Get('widgets')
  @RequirePermissions('reports.view')
  getWidgets(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query('role') role?: string,
  ) {
    return this.dashboardService.getWidgets(role, orgId, branchCtx);
  }

  @Get('payment-stats')
  @RequirePermissions('reports.view')
  getPaymentStats(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getPaymentStats(orgId, branchCtx, year);
  }
}
