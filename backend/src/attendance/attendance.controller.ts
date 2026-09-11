import { AuthenticatedRequest } from "../types";
import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AttendanceService } from "./attendance.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { ModuleGuard } from "../auth/module.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { RequireModule } from "../auth/module.decorator";
import { CurrentTenant } from "../auth/tenant.decorator";
import { CurrentBranch } from "../auth/branch.decorator";
import { BranchContext } from "../auth/branch-access";
import {
  MarkAttendanceDto,
  SingleAttendanceDto,
  QueryAttendanceDto,
  QueryMonthlyAttendanceDto,
  QueryStudentAttendanceDto,
} from "./dto/attendance.dto";

@ApiTags("Education - Attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule("ATTENDANCE")
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("monthly")
  @RequirePermissions("attendance.view")
  @ApiOperation({ summary: "Guruhning oylik davomat matritsasini olish" })
  getMonthlyAttendance(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryMonthlyAttendanceDto
  ) {
    return this.attendanceService.getMonthlyAttendance(
      query.groupId,
      query.month,
      orgId,
      branchCtx
    );
  }

  @Get()
  @RequirePermissions("attendance.view")
  @ApiOperation({ summary: "Guruhning bitta kungi davomat ro'yxatini olish" })
  getGroupAttendance(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryAttendanceDto
  ) {
    return this.attendanceService.getGroupAttendance(query.groupId, query.date, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions("attendance.create")
  @ApiOperation({ summary: "Guruh davomatini ommaviy saqlash" })
  markAttendance(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Body() body: MarkAttendanceDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.attendanceService.markAttendance(body, orgId, req.user?.id, branchCtx);
  }

  @Post("single")
  @RequirePermissions("attendance.create")
  @ApiOperation({ summary: "Yakka davomat belgilash" })
  markSingle(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Body() body: SingleAttendanceDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.attendanceService.markSingleAttendance(body, orgId, req.user?.id, branchCtx);
  }

  @Get("students/:studentId")
  @RequirePermissions("attendance.view")
  @ApiOperation({ summary: "O'quvchining shaxsiy davomat tarixini olish" })
  getStudentAttendance(
    @Param("studentId") studentId: string,
    @CurrentTenant() orgId: string,
    @Query() query: QueryStudentAttendanceDto
  ) {
    return this.attendanceService.getStudentAttendance(studentId, query, orgId);
  }
}
