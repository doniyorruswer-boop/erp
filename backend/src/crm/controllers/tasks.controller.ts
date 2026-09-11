import { AuthenticatedRequest } from "../../types";
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
import { TasksService } from "../services/tasks.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/permissions.guard";
import { ModuleGuard } from "../../auth/module.guard";
import { RequirePermissions } from "../../auth/permissions.decorator";
import { RequireModule } from "../../auth/module.decorator";
import { CurrentTenant } from "../../auth/tenant.decorator";
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from "../dto/task.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("CRM", "LEADS")
@Controller("crm/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions("crm.view")
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll({ ...query, orgId });
  }

  @Get(":id")
  @RequirePermissions("crm.view")
  findOne(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.tasksService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions("crm.create")
  create(
    @Body() body: CreateTaskDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.tasksService.create(body, orgId, req.user?.id);
  }

  @Put(":id")
  @RequirePermissions("crm.update")
  update(
    @Param("id") id: string,
    @Body() body: UpdateTaskDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.tasksService.update(id, body, orgId, req.user?.id);
  }

  @Post(":id/complete")
  @RequirePermissions("crm.update")
  complete(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.tasksService.complete(id, orgId, req.user?.id);
  }

  @Delete(":id")
  @RequirePermissions("crm.delete")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.tasksService.remove(id, orgId, req.user?.id);
  }

  @Post(":id/restore")
  @RequirePermissions("crm.delete")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.tasksService.restore(id, orgId, req.user?.id);
  }
}
