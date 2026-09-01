import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PipelinesService } from '../services/pipelines.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import {
  CreatePipelineDto,
  UpdatePipelineDto,
  CreatePipelineStageDto,
  UpdatePipelineStageDto,
  ReorderStagesDto,
} from '../dto/pipeline.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('CRM', 'LEADS')
@Controller('crm/pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @RequirePermissions('crm.view')
  findAll(@CurrentTenant() orgId: string) {
    return this.pipelinesService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('crm.view')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.pipelinesService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('crm.pipelines')
  create(@Body() body: CreatePipelineDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.pipelinesService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('crm.pipelines')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePipelineDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.pipelinesService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('crm.pipelines')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.pipelinesService.remove(id, orgId, req.user?.id);
  }

  @Post(':id/stages')
  @RequirePermissions('crm.pipelines')
  addStage(
    @Param('id') pipelineId: string,
    @Body() body: CreatePipelineStageDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.pipelinesService.addStage(pipelineId, body, orgId, req.user?.id);
  }

  @Put('stages/:stageId')
  @RequirePermissions('crm.pipelines')
  updateStage(
    @Param('stageId') stageId: string,
    @Body() body: UpdatePipelineStageDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.pipelinesService.updateStage(stageId, body, orgId, req.user?.id);
  }

  @Delete('stages/:stageId')
  @RequirePermissions('crm.pipelines')
  removeStage(
    @Param('stageId') stageId: string,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.pipelinesService.removeStage(stageId, orgId, req.user?.id);
  }

  @Post(':id/stages/reorder')
  @RequirePermissions('crm.pipelines')
  reorderStages(
    @Param('id') pipelineId: string,
    @Body() body: ReorderStagesDto,
    @CurrentTenant() orgId: string,
  ) {
    return this.pipelinesService.reorderStages(pipelineId, body.stageIds, orgId);
  }
}
