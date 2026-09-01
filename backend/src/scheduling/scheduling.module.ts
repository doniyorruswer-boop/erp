import { Module } from '@nestjs/common';
import { ResourcesService } from './services/resources.service';
import { ResourcesController } from './controllers/resources.controller';
import { ScheduleService } from './services/schedule.service';
import { ScheduleController } from './controllers/schedule.controller';

@Module({
  controllers: [ResourcesController, ScheduleController],
  providers: [ResourcesService, ScheduleService],
  exports: [ResourcesService, ScheduleService],
})
export class SchedulingModule {}
