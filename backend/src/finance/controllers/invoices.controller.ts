import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CurrentBranch } from '../../auth/branch.decorator';
import { BranchContext } from '../../auth/branch-access';
import { CreateInvoiceDto, UpdateInvoiceDto, QueryInvoiceDto } from '../dto/invoice.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('FINANCE')
@Controller('finance/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermissions('payments.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryInvoiceDto,
  ) {
    return this.invoicesService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('payments.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.invoicesService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('payments.create')
  create(
    @Body() body: CreateInvoiceDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.invoicesService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('payments.create')
  update(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.invoicesService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('payments.delete')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.invoicesService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('payments.delete')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.invoicesService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
