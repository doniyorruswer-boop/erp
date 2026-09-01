import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { ImportEntityType, PreviewImportDto, ConfirmImportDto, ExportQueryDto } from './dto/import-export.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('data-transfer')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('import/preview')
  @RequirePermissions('settings.manage')
  preview(@Body() body: PreviewImportDto, @CurrentTenant() orgId: string) {
    return this.importExportService.preview(body, orgId);
  }

  @Post('import/confirm')
  @RequirePermissions('settings.manage')
  confirm(@Body() body: ConfirmImportDto, @CurrentTenant() orgId: string, @Request() req: any) {
    return this.importExportService.confirm(body, orgId, req.user?.id);
  }

  @Get('export/:entity')
  @RequirePermissions('reports.view')
  async export(
    @Param('entity') entity: string,
    @Query() query: ExportQueryDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const entityType = entity.toUpperCase() as ImportEntityType;
    const result = await this.importExportService.export(entityType, query, orgId, req.user?.id, branchCtx);

    if (query.format === 'json') {
      return res.json(result);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.data);
  }
}
