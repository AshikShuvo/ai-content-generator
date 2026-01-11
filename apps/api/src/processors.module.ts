import { Module } from '@nestjs/common';
import { ContentQueueProcessor } from './queue/processors/content-queue.processor';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [ContentQueueProcessor],
  exports: [ContentQueueProcessor],
})
export class ProcessorsModule {}
