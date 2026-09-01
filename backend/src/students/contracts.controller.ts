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
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ModuleGuard } from '../auth/module.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RequireModule } from '../auth/module.decorator';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CurrentBranch } from '../auth/branch.decorator';
import { BranchContext } from '../auth/branch-access';
import { CreateContractDto, UpdateContractDto, QueryContractDto } from './dto/contract.dto';

@ApiTags('Education - Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ModuleGuard, PermissionsGuard)
@RequireModule('STUDENTS')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @RequirePermissions('students.view')
  @ApiOperation({ summary: 'Shartnomalar ro\'yxatini olish' })
  findAll(
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Query() query: QueryContractDto,
  ) {
    return this.contractsService.findAll(query, orgId, branchCtx);
  }

  @Get(':id')
  @RequirePermissions('students.view')
  @ApiOperation({ summary: 'Bitta shartnoma ma\'lumotlarini olish' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
  ) {
    return this.contractsService.findOne(id, orgId, branchCtx);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Yangi shartnoma rasmiylashtirish' })
  create(
    @Body() body: CreateContractDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.contractsService.create(body, orgId, req.user?.id, branchCtx);
  }

  @Put(':id')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Shartnoma ma\'lumotlarini tahrirlash' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateContractDto,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.contractsService.update(id, body, orgId, req.user?.id, branchCtx);
  }

  @Delete(':id')
  @RequirePermissions('students.delete')
  @ApiOperation({ summary: 'Shartnomani arxivlash (soft delete)' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.contractsService.remove(id, orgId, req.user?.id, branchCtx);
  }

  @Post(':id/restore')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Arxivlangan shartnomani qayta tiklash' })
  restore(
    @Param('id') id: string,
    @CurrentTenant() orgId: string,
    @CurrentBranch() branchCtx: BranchContext,
    @Request() req: any,
  ) {
    return this.contractsService.restore(id, orgId, req.user?.id, branchCtx);
  }
}
