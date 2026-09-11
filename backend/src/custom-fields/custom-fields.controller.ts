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
import { CustomFieldsService } from "./custom-fields.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  QueryFieldDefinitionDto,
  ValidateCustomFieldsDto,
} from "./dto/custom-field.dto";

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("custom-fields")
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Get("definitions")
  @RequirePermissions("settings.manage")
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryFieldDefinitionDto) {
    return this.customFieldsService.findAll({ ...query, orgId });
  }

  @Get("definitions/:id")
  @RequirePermissions("settings.manage")
  findOne(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.customFieldsService.findOne(id, orgId);
  }

  @Post("definitions")
  @RequirePermissions("settings.manage")
  create(
    @Body() body: CreateFieldDefinitionDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customFieldsService.create(body, orgId, req.user?.id);
  }

  @Put("definitions/:id")
  @RequirePermissions("settings.manage")
  update(
    @Param("id") id: string,
    @Body() body: UpdateFieldDefinitionDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customFieldsService.update(id, body, orgId, req.user?.id);
  }

  @Delete("definitions/:id")
  @RequirePermissions("settings.manage")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customFieldsService.remove(id, orgId, req.user?.id);
  }

  @Post("definitions/:id/restore")
  @RequirePermissions("settings.manage")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customFieldsService.restore(id, orgId, req.user?.id);
  }

  @Post("validate")
  validateCustomFields(@Body() body: ValidateCustomFieldsDto, @CurrentTenant() orgId: string) {
    return this.customFieldsService.validateCustomFieldValues(body.entityType, body.values, orgId);
  }
}
