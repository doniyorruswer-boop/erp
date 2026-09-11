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
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import {
  SendNotificationDto,
  SendEventNotificationDto,
  QueryNotificationDto,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from "./dto/notification.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions("notifications.view")
  findAll(
    @CurrentTenant() orgId: string,
    @Query() query: QueryNotificationDto,
    @Request() req: AuthenticatedRequest
  ) {
    const isOrgAdmin = req.user?.role === "SUPER_ADMIN" || req.user?.role === "ADMIN";
    const userId = query.userId || (isOrgAdmin ? undefined : req.user?.id);
    return this.notificationsService.findAll({ ...query, userId }, orgId);
  }

  @Post("send")
  @RequirePermissions("settings.manage")
  send(@Body() body: SendNotificationDto, @CurrentTenant() orgId: string) {
    return this.notificationsService.send(body, orgId);
  }

  @Post("send-event")
  @RequirePermissions("settings.manage")
  sendEvent(@Body() body: SendEventNotificationDto, @CurrentTenant() orgId: string) {
    return this.notificationsService.sendEvent(body, orgId);
  }

  @Put(":id/read")
  @RequirePermissions("notifications.view")
  markAsRead(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.notificationsService.markAsRead(id, orgId);
  }

  @Post("read-all")
  @RequirePermissions("notifications.view")
  markAllAsRead(@CurrentTenant() orgId: string, @Request() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(req.user?.id, orgId);
  }

  // Templates
  @Get("templates")
  @RequirePermissions("settings.manage")
  getTemplates(@CurrentTenant() orgId: string) {
    return this.notificationsService.getTemplates(orgId);
  }

  @Post("templates")
  @RequirePermissions("settings.manage")
  createTemplate(@Body() body: CreateNotificationTemplateDto, @CurrentTenant() orgId: string) {
    return this.notificationsService.createTemplate(body, orgId);
  }

  @Put("templates/:id")
  @RequirePermissions("settings.manage")
  updateTemplate(
    @Param("id") id: string,
    @Body() body: UpdateNotificationTemplateDto,
    @CurrentTenant() orgId: string
  ) {
    return this.notificationsService.updateTemplate(id, body, orgId);
  }

  @Delete("templates/:id")
  @RequirePermissions("settings.manage")
  deleteTemplate(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.notificationsService.deleteTemplate(id, orgId);
  }
}
