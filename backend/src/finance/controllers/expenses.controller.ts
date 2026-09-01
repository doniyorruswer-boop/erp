import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CurrentBranch } from '../../auth/branch.decorator';
import { BranchContext } from '../../auth/branch-access';
import { CreateExpenseDto, UpdateExpenseDto, CreateExpenseCategoryDto, QueryExpenseDto } from '../dto/expense.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('FINANCE')
@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('categories')
  @RequirePermissions('payments.view')
  getCategories(@CurrentTenant() orgId: string) {
    return this.expensesService.getCategories(orgId);
  }

  @Post('categories')
  @RequirePermissions('settings.manage')
  createCategory(@Body() body: CreateExpenseCategoryDto, @CurrentTenant() orgId: string) {
    return this.expensesService.createCategory(body, orgId);
  }

  @Get()
  @RequirePermissions('payments.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryExpenseDto,
  ) {
    return this.expensesService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('payments.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.expensesService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('payments.create')
  create(
    @Body() body: CreateExpenseDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.expensesService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('payments.create')
  update(
    @Param('id') id: string,
    @Body() body: UpdateExpenseDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.expensesService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('payments.delete')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.expensesService.remove(id, orgId, req.user?.id, branchCtx);
  }
}
