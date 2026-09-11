import { AuthenticatedRequest } from "../../types";
import { Controller, Get, Post, Body, Query, UseGuards, Request } from "@nestjs/common";
import { FinanceService } from "../services/finance.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/permissions.guard";
import { ModuleGuard } from "../../auth/module.guard";
import { RequirePermissions } from "../../auth/permissions.decorator";
import { RequireModule } from "../../auth/module.decorator";
import { CurrentTenant } from "../../auth/tenant.decorator";
import { CurrentBranch } from "../../auth/branch.decorator";
import { BranchContext } from "../../auth/branch-access";
import { AllocatePaymentDto, CreateRefundDto } from "../dto/payment-allocation.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("FINANCE")
@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("summary")
  @RequirePermissions("reports.view")
  getSummary(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query("branchId") branchId?: string
  ) {
    return this.financeService.getSummary(orgId, branchId, branchCtx);
  }

  @Post("allocate")
  @RequirePermissions("payments.create")
  allocatePayment(
    @Body() body: AllocatePaymentDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.financeService.allocatePayment(body, orgId, req.user?.id);
  }

  @Post("refund")
  @RequirePermissions("payments.refund")
  refundPayment(
    @Body() body: CreateRefundDto,
    @CurrentTenant() orgId: string,
    @Request() req: AuthenticatedRequest
  ) {
    return this.financeService.refundPayment(body, orgId, req.user?.id);
  }
}
