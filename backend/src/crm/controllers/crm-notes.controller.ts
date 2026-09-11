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
import { CrmNotesService } from "../services/crm-notes.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/permissions.guard";
import { ModuleGuard } from "../../auth/module.guard";
import { RequirePermissions } from "../../auth/permissions.decorator";
import { RequireModule } from "../../auth/module.decorator";
import { CurrentTenant } from "../../auth/tenant.decorator";
import { CreateCrmNoteDto, UpdateCrmNoteDto } from "../dto/crm-note.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("CRM", "LEADS")
@Controller("crm/notes")
export class CrmNotesController {
  constructor(private readonly crmNotesService: CrmNotesService) {}

  @Get()
  @RequirePermissions("crm.view")
  findAll(
    @CurrentTenant() orgId: string,
    @Query("leadId") leadId?: string,
    @Query("customerId") customerId?: string
  ) {
    return this.crmNotesService.findAll({ leadId, customerId, orgId });
  }

  @Post()
  @RequirePermissions("crm.create")
  create(
    @Body() body: CreateCrmNoteDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.crmNotesService.create(body, orgId, req.user?.id);
  }

  @Put(":id")
  @RequirePermissions("crm.update")
  update(@Param("id") id: string, @Body() body: UpdateCrmNoteDto, @CurrentTenant() orgId: string) {
    return this.crmNotesService.update(id, body, orgId);
  }

  @Delete(":id")
  @RequirePermissions("crm.delete")
  remove(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.crmNotesService.remove(id, orgId);
  }
}
