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
import { ParentsService } from './parents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateParentDto, UpdateParentDto, QueryParentDto, LinkStudentParentDto } from './dto/parent.dto';

@ApiTags('Education - Parents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('STUDENTS')
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  @RequirePermissions('students.view')
  @ApiOperation({ summary: 'Ota-onalar ro\'yxatini olish' })
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryParentDto) {
    return this.parentsService.findAll(query, orgId);
  }

  @Get(':id')
  @RequirePermissions('students.view')
  @ApiOperation({ summary: 'Bitta ota-ona ma\'lumotlarini va farzandlarini olish' })
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.parentsService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Yangi ota-ona / vasiy profilini yaratish' })
  create(
    @Body() body: CreateParentDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.parentsService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Ota-ona ma\'lumotlarini yangilash' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateParentDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.parentsService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('students.delete')
  @ApiOperation({ summary: 'Ota-onani o\'chirish (Soft delete)' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.parentsService.remove(id, orgId, req.user?.id);
  }

  @Post('link')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Ota-ona va Farzandni o\'zaro bog\'lash (M:N)' })
  linkStudent(
    @Body() body: LinkStudentParentDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.parentsService.linkStudent(body, orgId, req.user?.id);
  }

  @Delete(':parentId/students/:studentId')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Ota-ona va Farzand bog\'lanishini uzish' })
  unlinkStudent(
    @Param('parentId') parentId: string,
    @Param('studentId') studentId: string,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.parentsService.unlinkStudent(studentId, parentId, orgId, req.user?.id);
  }
}
