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
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { ModuleGuard } from "../auth/module.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { RequireModule } from "../auth/module.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import { CurrentBranch } from "../auth/branch.decorator";
import { BranchContext } from "../auth/branch-access";
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  QueryPaymentDto,
  VoidPaymentDto,
  RefundPaymentDto,
} from "./dto/payment.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("PAYMENTS", "FINANCE")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermissions("payments.view")
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryPaymentDto
  ) {
    return this.paymentsService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get("summary")
  @RequirePermissions("payments.view")
  getFinancialSummary(@CurrentTenant() orgId: string, @CurrentBranch() branchCtx: BranchContext) {
    return this.paymentsService.getFinancialSummary(orgId, branchCtx);
  }

  @Get(":id")
  @RequirePermissions("payments.view")
  findOne(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext
  ) {
    return this.paymentsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions("payments.create")
  create(
    @Body() body: CreatePaymentDto,
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext
  ) {
    return this.paymentsService.create(
      {
        ...body,
        receivedById: req.user?.id,
      },
      orgId,
      req.user?.id,
      branchCtx
    );
  }

  @Put(":id")
  @RequirePermissions("payments.create")
  update(
    @Param("id") id: string,
    @Body() body: UpdatePaymentDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.paymentsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Post(":id/void")
  @RequirePermissions("payments.delete")
  voidPayment(
    @Param("id") id: string,
    @Body() body: VoidPaymentDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.paymentsService.voidPayment(id, body?.reason, req.user?.id, orgId, branchCtx);
  }

  @Post(":id/refund")
  @RequirePermissions("payments.refund")
  refundPayment(
    @Param("id") id: string,
    @Body() body: RefundPaymentDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.paymentsService.refundPayment(id, body, req.user?.id, orgId, branchCtx);
  }

  @Delete(":id")
  @RequirePermissions("payments.delete")
  delete(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.paymentsService.delete(id, orgId, req.user?.id, branchCtx);
  }
}
