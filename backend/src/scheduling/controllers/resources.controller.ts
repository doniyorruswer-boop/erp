import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ResourcesService } from '../services/resources.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CurrentBranch } from '../../auth/branch.decorator';
import { BranchContext } from '../../auth/branch-access';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from '../dto/resource.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('ROOMS', 'EDUCATION')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @RequirePermissions('rooms.manage')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryResourceDto,
  ) {
    return this.resourcesService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('rooms.manage')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.resourcesService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('rooms.manage')
  create(
    @Body() body: CreateResourceDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.resourcesService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('rooms.manage')
  update(
    @Param('id') id: string,
    @Body() body: UpdateResourceDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.resourcesService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('rooms.manage')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.resourcesService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('rooms.manage')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.resourcesService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
