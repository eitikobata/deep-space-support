import { Module } from '@nestjs/common';
import { LogEntriesController } from './log-entries.controller';
import { LogEntriesService } from './log-entries.service';

@Module({
  controllers: [LogEntriesController],
  providers: [LogEntriesService],
})
export class LogEntriesModule {}
