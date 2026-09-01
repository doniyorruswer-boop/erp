import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto/course.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('COURSES')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @RequirePermissions('courses.view')
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryCourseDto) {
    return this.coursesService.findAll({ search: query.search, orgId });
  }

  @Get(':id')
  @RequirePermissions('courses.view')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.coursesService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('courses.create')
  create(@Body() body: CreateCourseDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.coursesService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('courses.update')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCourseDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.coursesService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('courses.delete')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.coursesService.remove(id, orgId, req.user?.id);
  }

  @Post(':id/restore')
  @RequirePermissions('courses.delete')
  restore(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.coursesService.restore(id, orgId, req.user?.id);
  }
}
