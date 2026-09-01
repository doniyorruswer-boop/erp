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
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateLessonDto, UpdateLessonDto, QueryLessonDto } from './dto/lesson.dto';

@ApiTags('Education - Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('ATTENDANCE')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @RequirePermissions('attendance.view')
  @ApiOperation({ summary: 'Darslar ro\'yxatini olish' })
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryLessonDto,
  ) {
    return this.lessonsService.findAll(query, orgId, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('attendance.view')
  @ApiOperation({ summary: 'Bitta dars ma\'lumotlarini olish' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.lessonsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('attendance.create')
  @ApiOperation({ summary: 'Yangi dars jadvali yaratish' })
  create(
    @Body() body: CreateLessonDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.lessonsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('attendance.update')
  @ApiOperation({ summary: 'Dars ma\'lumotlarini yangilash' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateLessonDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.lessonsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('attendance.update')
  @ApiOperation({ summary: 'Darsni o\'chirish' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.lessonsService.remove(id, orgId, req.user?.id, branchCtx);
  }
}
