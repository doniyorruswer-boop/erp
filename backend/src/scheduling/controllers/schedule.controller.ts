import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CurrentBranch } from '../../auth/branch.decorator';
import { BranchContext } from '../../auth/branch-access';
import { CreateScheduleDto, UpdateScheduleDto, QueryScheduleDto, CheckConflictDto } from '../dto/schedule.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('GROUPS', 'STUDENTS', 'EDUCATION')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @RequirePermissions('attendance.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryScheduleDto,
  ) {
    return this.scheduleService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('attendance.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.scheduleService.findOne(id, orgId, branchCtx);
  }

  @Post('check-conflict')
  @RequirePermissions('attendance.view')
  checkConflict(
    @Body() body: CheckConflictDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.scheduleService.detectConflicts({ ...body, orgId }, branchCtx);
  }

  @Post()
  @RequirePermissions('groups.update')
  create(
    @Body() body: CreateScheduleDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.scheduleService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('groups.update')
  update(
    @Param('id') id: string,
    @Body() body: UpdateScheduleDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.scheduleService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('groups.update')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.scheduleService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('groups.update')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.scheduleService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
