import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateRoomDto, UpdateRoomDto, QueryRoomDto } from './dto/room.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('ROOMS')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @RequirePermissions('rooms.manage')
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryRoomDto,
  ) {
    return this.roomsService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('rooms.manage')
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.roomsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('rooms.manage')
  create(
    @Body() data: CreateRoomDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.roomsService.create(data, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('rooms.manage')
  update(
    @Param('id') id: string,
    @Body() data: UpdateRoomDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.roomsService.update(id, data, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('rooms.manage')
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.roomsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('rooms.manage')
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.roomsService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
