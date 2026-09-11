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
import { GroupsService } from "./groups.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { ModuleGuard } from "../auth/module.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { RequireModule } from "../auth/module.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import { CurrentBranch } from "../auth/branch.decorator";
import { BranchContext } from "../auth/branch-access";
import { CreateGroupDto, UpdateGroupDto, QueryGroupDto, GenerateLessonsDto } from "./dto/group.dto";

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("GROUPS")
@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @RequirePermissions("groups.view")
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryGroupDto
  ) {
    return this.groupsService.findAll({ ...query, orgId }, branchCtx);
  }

  @Get("history/enrollments")
  @RequirePermissions("groups.view")
  getEnrollmentHistory(
    @CurrentTenant() orgId: string,
    @Query("studentId") studentId?: string,
    @Query("groupId") groupId?: string
  ) {
    return this.groupsService.getEnrollmentHistory({ studentId, groupId, orgId });
  }

  @Get("workload/teachers")
  @RequirePermissions("groups.view")
  getTeacherWorkload(@CurrentTenant() orgId: string, @Query("teacherId") teacherId?: string) {
    return this.groupsService.getTeacherWorkload(teacherId, orgId);
  }

  @Get(":id")
  @RequirePermissions("groups.view")
  findOne(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext
  ) {
    return this.groupsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions("groups.create")
  create(
    @Body() body: CreateGroupDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.groupsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(":id")
  @RequirePermissions("groups.update")
  update(
    @Param("id") id: string,
    @Body() body: UpdateGroupDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.groupsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(":id")
  @RequirePermissions("groups.delete")
  remove(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.groupsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(":id/restore")
  @RequirePermissions("groups.delete")
  restore(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest
  ) {
    return this.groupsService.restore(id, orgId, req.user?.id, branchCtx);
  }

  @Post(":id/transfer/:targetGroupId/students/:studentId")
  @RequirePermissions("groups.update")
  transferStudent(
    @Param("id") sourceGroupId: string,
    @Param("targetGroupId") targetGroupId: string,
    @Param("studentId") studentId: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest,
    @Body("reason") reason?: string
  ) {
    return this.groupsService.transferStudent(
      sourceGroupId,
      targetGroupId,
      studentId,
      orgId,
      reason,
      req?.user?.id,
      branchCtx
    );
  }

  @Post(":id/students/:studentId")
  @RequirePermissions("groups.update")
  addStudent(
    @Param("id") groupId: string,
    @Param("studentId") studentId: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest,
    @Body("reason") reason?: string
  ) {
    return this.groupsService.addStudent(
      groupId,
      studentId,
      orgId,
      req.user?.id,
      reason,
      branchCtx
    );
  }

  @Delete(":id/students/:studentId")
  @RequirePermissions("groups.update")
  removeStudent(
    @Param("id") groupId: string,
    @Param("studentId") studentId: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: AuthenticatedRequest,
    @Body("reason") reason?: string
  ) {
    return this.groupsService.removeStudent(
      groupId,
      studentId,
      orgId,
      req.user?.id,
      reason,
      branchCtx
    );
  }

  @Post(":id/generate-lessons")
  @RequirePermissions("groups.update")
  generateLessons(
    @Param("id") id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Body() body: GenerateLessonsDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.groupsService.generateLessonsForGroup(id, orgId, req.user?.id, branchCtx, body);
  }
}
