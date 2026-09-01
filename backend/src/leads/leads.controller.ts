import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateLeadDto, UpdateLeadDto, QueryLeadDto, MoveLeadStageDto } from './dto/lead.dto';
import { ConvertLeadDto } from '../crm/dto/convert-lead.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('LEADS')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('kanban')
  @RequirePermissions('leads.view')
  getKanban(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query('pipelineId') pipelineId?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.leadsService.getKanbanBoard(pipelineId, orgId, branchId, branchCtx);
  }

  @Get()
  @RequirePermissions('leads.view')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryLeadDto,
  ) {
    return this.leadsService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('leads.view')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.leadsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('leads.create')
  create(
    @Body() body: CreateLeadDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('leads.update')
  update(
    @Param('id') id: string,
    @Body() body: UpdateLeadDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/stage')
  @RequirePermissions('leads.update')
  moveToStage(
    @Param('id') id: string,
    @Body() body: MoveLeadStageDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.moveToStage(id, body.stageId, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/convert')
  @RequirePermissions('leads.update')
  convertLead(
    @Param('id') id: string,
    @Body() body: ConvertLeadDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.convert(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('leads.delete')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('leads.delete')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.leadsService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
