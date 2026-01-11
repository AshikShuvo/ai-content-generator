import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CONTENT_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CONTENT_QUEUE,
    }),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
