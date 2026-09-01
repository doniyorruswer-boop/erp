import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateWorkflowDto, UpdateWorkflowDto, TriggerEventDto } from './dto/workflow.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('WORKFLOW', 'AUTOMATION')
@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  @RequirePermissions('settings.manage')
  findAll(@CurrentTenant() orgId: string) {
    return this.workflowService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('settings.manage')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.workflowService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('settings.manage')
  create(@Body() body: CreateWorkflowDto, @CurrentTenant() orgId: string) {
    return this.workflowService.createRule(body, orgId);
  }

  @Put(':id')
  @RequirePermissions('settings.manage')
  update(@Param('id') id: string, @Body() body: UpdateWorkflowDto, @CurrentTenant() orgId: string) {
    return this.workflowService.updateRule(id, body, orgId);
  }

  @Delete(':id')
  @RequirePermissions('settings.manage')
  delete(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.workflowService.deleteRule(id, orgId);
  }

  @Post('trigger-event')
  @RequirePermissions('settings.manage')
  triggerEvent(@Body() body: TriggerEventDto, @CurrentTenant() orgId: string) {
    return this.workflowService.processEvent(body.event, body.payload, orgId);
  }
}
