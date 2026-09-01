import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CashboxService } from '../services/cashbox.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CurrentBranch } from '../../auth/branch.decorator';
import { BranchContext } from '../../auth/branch-access';
import { CreateCashboxDto, UpdateCashboxDto, QueryCashboxDto } from '../dto/cashbox.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('FINANCE', 'PAYMENTS')
@Controller('finance/cashboxes')
export class CashboxController {
  constructor(private readonly cashboxService: CashboxService) {}

  @Get()
  @RequirePermissions('payments.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryCashboxDto,
  ) {
    return this.cashboxService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('payments.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.cashboxService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('settings.manage')
  create(
    @Body() body: CreateCashboxDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.cashboxService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('settings.manage')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCashboxDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.cashboxService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('settings.manage')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.cashboxService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('settings.manage')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.cashboxService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
