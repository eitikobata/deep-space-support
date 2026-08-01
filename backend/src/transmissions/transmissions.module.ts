import { Module } from '@nestjs/common';
import { TransmissionsController } from './transmissions.controller';
import { TransmissionsService } from './transmissions.service';

@Module({
  controllers: [TransmissionsController],
  providers: [TransmissionsService],
})
export class TransmissionsModule {}
