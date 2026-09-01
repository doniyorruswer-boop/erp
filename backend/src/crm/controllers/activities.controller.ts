import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ActivitiesService } from '../services/activities.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CreateActivityDto, QueryActivityDto } from '../dto/activity.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('CRM', 'LEADS')
@Controller('crm/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @RequirePermissions('crm.view')
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryActivityDto) {
    return this.activitiesService.findAll({ ...query, orgId });
  }

  @Post()
  @RequirePermissions('crm.create')
  create(@Body() body: CreateActivityDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.activitiesService.create(body, orgId, req.user?.id);
  }
}
