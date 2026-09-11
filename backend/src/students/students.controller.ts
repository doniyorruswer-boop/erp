import { AuthenticatedRequest } from "../types";
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { StudentsService } from "./students.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { ModuleGuard } from "../auth/module.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { RequireModule } from "../auth/module.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import { CurrentBranch } from "../auth/branch.decorator";
import { BranchContext } from "../auth/branch-access";
import { CreateStudentDto, UpdateStudentDto, QueryStudentDto } from "./dto/student.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("STUDENTS")
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermissions("students.view")
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryStudentDto
  ) {
    return this.studentsService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get(":id")
  @RequirePermissions("students.view")
  findOne(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext
  ) {
    return this.studentsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions("students.create")
  create(
    @Body() body: CreateStudentDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(":id")
  @RequirePermissions("students.update")
  update(
    @Param("id") id: string,
    @Body() body: UpdateStudentDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(":id")
  @RequirePermissions("students.delete")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Get(":id/progress")
  @RequirePermissions("students.view")
  getProgress(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext
  ) {
    return this.studentsService.getProgress(id, orgId, branchCtx);
  }

  @Post(":id/freeze")
  @RequirePermissions("students.update")
  freeze(
    @Param("id") id: string,
    @Body("reason") reason: string,
    @Body("returnDate") returnDate: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.freeze(id, reason, returnDate, req.user?.id, orgId, branchCtx);
  }

  @Post(":id/unfreeze")
  @RequirePermissions("students.update")
  unfreeze(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.unfreeze(id, req.user?.id, orgId, branchCtx);
  }

  @Post(":id/graduate")
  @RequirePermissions("students.update")
  graduate(
    @Param("id") id: string,
    @Body() body: { groupId?: string; certificateNumber?: string; score?: number },
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.graduate(id, body, req.user?.id, orgId, branchCtx);
  }

  @Post(":id/restore")
  @RequirePermissions("students.delete")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.studentsService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
