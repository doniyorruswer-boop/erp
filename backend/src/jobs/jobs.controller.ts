import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateJobDto, QueryJobDto } from './dto/job.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @RequirePermissions('settings.manage')
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryJobDto) {
    return this.jobsService.findAll(query, orgId);
  }

  @Get(':id')
  @RequirePermissions('settings.manage')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.jobsService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('settings.manage')
  create(@Body() body: CreateJobDto, @CurrentTenant() orgId: string) {
    return this.jobsService.addJob(body, orgId);
  }

  @Post('trigger-maintenance')
  @RequirePermissions('settings.manage')
  triggerMaintenance(@CurrentTenant() orgId: string) {
    return this.jobsService.triggerMaintenanceJobs(orgId);
  }

  @Post(':id/retry')
  @RequirePermissions('settings.manage')
  retryJob(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.jobsService.retryJob(id, orgId);
  }
}
