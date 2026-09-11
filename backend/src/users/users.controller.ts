import { AuthenticatedRequest } from "../types";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import { CreateUserDto, UpdateUserDto, QueryUserDto } from "./dto/user.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions("settings.manage")
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryUserDto) {
    return this.usersService.findAll({ ...query, orgId });
  }

  @Get(":id")
  @RequirePermissions("settings.manage")
  findOne(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.usersService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions("settings.manage")
  create(
    @Body() data: CreateUserDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.usersService.create(data, orgId, req.user?.id);
  }

  @Put(":id")
  @RequirePermissions("settings.manage")
  update(
    @Param("id") id: string,
    @Body() data: UpdateUserDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.usersService.update(id, data, orgId, req.user?.id);
  }

  @Delete(":id")
  @RequirePermissions("settings.manage")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.usersService.remove(id, orgId, req.user?.id);
  }

  @Post(":id/restore")
  @RequirePermissions("settings.manage")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.usersService.restore(id, orgId, req.user?.id);
  }
}
