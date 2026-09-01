import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermissions('settings.manage')
  getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get()
  @RequirePermissions('settings.manage')
  findAll(@CurrentTenant() orgId: string) {
    return this.rolesService.findAll(orgId);
  }

  @Get(':id')
  @RequirePermissions('settings.manage')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.rolesService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('settings.manage')
  create(@Body() body: CreateRoleDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.rolesService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('settings.manage')
  update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.rolesService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('settings.manage')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.rolesService.remove(id, orgId, req.user?.id);
  }

  @Post(':id/restore')
  @RequirePermissions('settings.manage')
  restore(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.rolesService.restore(id, orgId, req.user?.id);
  }
}
