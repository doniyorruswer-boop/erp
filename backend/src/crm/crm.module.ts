import { Module } from '@nestjs/common';
import { PipelinesService } from './services/pipelines.service';
import { PipelinesController } from './controllers/pipelines.controller';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { ActivitiesService } from './services/activities.service';
import { ActivitiesController } from './controllers/activities.controller';
import { CrmNotesService } from './services/crm-notes.service';
import { CrmNotesController } from './controllers/crm-notes.controller';

@Module({
  controllers: [
    PipelinesController,
    CustomersController,
    TasksController,
    ActivitiesController,
    CrmNotesController,
  ],
  providers: [
    PipelinesService,
    CustomersService,
    TasksService,
    ActivitiesService,
    CrmNotesService,
  ],
  exports: [
    PipelinesService,
    CustomersService,
    TasksService,
    ActivitiesService,
    CrmNotesService,
  ],
})
export class CrmModule {}
