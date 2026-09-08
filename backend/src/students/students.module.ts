import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, AuditModule, WorkflowModule, SubscriptionsModule],
  controllers: [StudentsController, ParentsController, ContractsController],
  providers: [StudentsService, ParentsService, ContractsService],
  exports: [StudentsService, ParentsService, ContractsService],
})
export class StudentsModule {}
