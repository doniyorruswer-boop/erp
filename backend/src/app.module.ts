import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BranchesModule } from './branches/branches.module';
import { RolesModule } from './roles/roles.module';
import { RoomsModule } from './rooms/rooms.module';
import { CoursesModule } from './courses/courses.module';
import { GroupsModule } from './groups/groups.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LeadsModule } from './leads/leads.module';
import { SetupModule } from './setup/setup.module';
import { EmployeesModule } from './employees/employees.module';
import { AuditModule } from './audit/audit.module';
import { CrmModule } from './crm/crm.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { FinanceModule } from './finance/finance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { JobsModule } from './jobs/jobs.module';
import { ImportExportModule } from './import-export/import-export.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { WorkflowModule } from './workflow/workflow.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuditModule,
    CustomFieldsModule,
    SchedulingModule,
    FinanceModule,
    NotificationsModule,
    JobsModule,
    ImportExportModule,
    SubscriptionsModule,
    WorkflowModule,
    HealthModule,
    AuthModule,
    CrmModule,
    UsersModule,
    BranchesModule,
    RolesModule,
    RoomsModule,
    CoursesModule,
    GroupsModule,
    StudentsModule,
    AttendanceModule,
    PaymentsModule,
    DashboardModule,
    LeadsModule,
    SetupModule,
    EmployeesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
