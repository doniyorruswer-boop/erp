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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateExamDto, UpdateExamDto, QueryExamDto, RecordGradesDto } from './dto/exam.dto';

@ApiTags('Education - Exams & Grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('GROUPS')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @RequirePermissions('groups.view')
  @ApiOperation({ summary: 'Imtihonlar ro\'yxatini olish' })
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryExamDto,
  ) {
    return this.examsService.findAll(query, orgId, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('groups.view')
  @ApiOperation({ summary: 'Imtihon ma\'lumotlarini va baholar ro\'yxatini olish' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.examsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('groups.update')
  @ApiOperation({ summary: 'Yangi imtihon yaratish' })
  create(
    @Body() body: CreateExamDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.examsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('groups.update')
  @ApiOperation({ summary: 'Imtihon parametrlarini tahrirlash' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateExamDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.examsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('groups.update')
  @ApiOperation({ summary: 'Imtihonni o\'chirish (Soft delete)' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.examsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post('grades')
  @RequirePermissions('groups.update')
  @ApiOperation({ summary: 'Guruh imtihon yoki dars baholarini ommaviy saqlash' })
  recordGrades(
    @Body() body: RecordGradesDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.examsService.recordGrades(body, orgId, req.user?.id);
  }

  @Get('students/:studentId/grades')
  @RequirePermissions('students.view')
  @ApiOperation({ summary: 'O\'quvchining barcha baholari tarixini olish' })
  getStudentGrades(
    @Param('studentId') studentId: string,
    @CurrentTenant() orgId: string,
  ) {
    return this.examsService.getStudentGrades(studentId, orgId);
  }
}
