import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { ModuleGuard } from '../../auth/module.guard';
import { RequirePermissions } from '../../auth/permissions.decorator';
import { RequireModule } from '../../auth/module.decorator';
import { CurrentTenant } from '../../auth/tenant.decorator';
import { CreateProductServiceDto, UpdateProductServiceDto, QueryProductServiceDto } from '../dto/product-service.dto';

@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('FINANCE')
@Controller('finance/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @RequirePermissions('payments.view')
  findAll(@CurrentTenant() orgId: string, @Query() query: QueryProductServiceDto) {
    return this.catalogService.findAll({ ...query, orgId });
  }

  @Get(':id')
  @RequirePermissions('payments.view')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.catalogService.findOne(id, orgId);
  }

  @Post()
  @RequirePermissions('courses.create')
  create(@Body() body: CreateProductServiceDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.catalogService.create(body, orgId, req.user?.id);
  }

  @Put(':id')
  @RequirePermissions('courses.update')
  update(
    @Param('id') id: string,
    @Body() body: UpdateProductServiceDto,
    @CurrentTenant() orgId: string,
    @Request() req: any,
  ) {
    return this.catalogService.update(id, body, orgId, req.user?.id);
  }

  @Delete(':id')
  @RequirePermissions('courses.delete')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.catalogService.remove(id, orgId, req.user?.id);
  }

  @Post(':id/restore')
  @RequirePermissions('courses.delete')
  restore(@Param('id') id: string, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.catalogService.restore(id, orgId, req.user?.id);
  }
}
