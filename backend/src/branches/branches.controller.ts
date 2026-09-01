import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateBranchDto, UpdateBranchDto, AssignUserToBranchDto, QueryBranchDto } from './dto/branch.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @RequirePermissions('branches.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryBranchDto,
  ) {
    return this.branchesService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('branches.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.branchesService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('branches.create')
  create(@Body() body: CreateBranchDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.branchesService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('branches.create')
  update(
    @Param('id') id: string,
    @Body() body: UpdateBranchDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.branchesService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('branches.create')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.branchesService.remove(id, orgId, req.user?.id);
  }

  @Post(':id/restore')
  @RequirePermissions('branches.create')
  restore(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.branchesService.restore(id, orgId, req.user?.id);
  }

  @Post(':id/users/:userId')
  @RequirePermissions('branches.create')
  assignUser(
    @Param('id') branchId: string,
    @Param('userId') userId: string,
    @Body() body: AssignUserToBranchDto,
  ) {
    return this.branchesService.assignUserToBranch(branchId, userId, body.isDefault);
  }

  @Delete(':id/users/:userId')
  @RequirePermissions('branches.create')
  removeUser(@Param('id') branchId: string, @Param('userId') userId: string) {
    return this.branchesService.removeUserFromBranch(branchId, userId);
  }

  @Get('user/:userId')
  @RequirePermissions('branches.view')
  getUserBranches(@Param('userId') userId: string) {
    return this.branchesService.getUserBranches(userId);
  }
}
