import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../auth/tenant.decorator';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto, CreatePayrollDto } from './dto/employee.dto';

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto, @CurrentTenant() orgId: string) {
    return this.employeesService.create(dto, orgId);
  }

  @Get()
  findAll(@Query() query: QueryEmployeeDto, @CurrentTenant() orgId: string) {
    return this.employeesService.findAll(query, orgId);
  }

  @Get('payroll/summary')
  getPayrollSummary(@Query('period') period: string, @CurrentTenant() orgId: string) {
    const targetPeriod = period || new Date().toISOString().slice(0, 7);
    return this.employeesService.getPayrollSummary(targetPeriod, orgId);
  }

  @Post('payroll')
  createPayroll(@Body() dto: CreatePayrollDto, @CurrentTenant() orgId: string) {
    return this.employeesService.createPayroll(dto, orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.employeesService.findOne(id, orgId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @CurrentTenant() orgId: string) {
    return this.employeesService.update(id, dto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.employeesService.remove(id, orgId);
  }

  @Get(':id/payroll')
  getEmployeePayrolls(@Param('id') id: string, @CurrentTenant() orgId: string) {
    return this.employeesService.getEmployeePayrolls(id, orgId);
  }
}
