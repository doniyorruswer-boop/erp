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
import { CustomersService } from "../services/customers.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/permissions.guard";
import { ModuleGuard } from "../../auth/module.guard";
import { RequirePermissions } from "../../auth/permissions.decorator";
import { RequireModule } from "../../auth/module.decorator";
import { CurrentTenant } from "../../auth/tenant.decorator";
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomerDto } from "../dto/customer.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("CRM", "LEADS")
@Controller("crm/customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions("crm.view")
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryCustomerDto) {
    return this.customersService.findAll({ ...query, orgId });
  }

  @Get(":id")
  @RequirePermissions("crm.view")
  findOne(@Param("id") id: string, @CurrentTenant() orgId: string) {
    return this.customersService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions("crm.create")
  create(
    @Body() body: CreateCustomerDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customersService.create(body, orgId, req.user?.id);
  }

  @Put(":id")
  @RequirePermissions("crm.update")
  update(
    @Param("id") id: string,
    @Body() body: UpdateCustomerDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customersService.update(id, body, orgId, req.user?.id);
  }

  @Delete(":id")
  @RequirePermissions("crm.delete")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customersService.remove(id, orgId, req.user?.id);
  }

  @Post(":id/restore")
  @RequirePermissions("crm.delete")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.customersService.restore(id, orgId, req.user?.id);
  }
}
