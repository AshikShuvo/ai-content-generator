import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue, Job } from 'bull';
import { CONTENT_QUEUE } from './queue.constants';

export interface ContentGenerationJob {
  contentId: string;
  userId: string;
  prompt: string;
  contentType: string;
  title: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(CONTENT_QUEUE)
    private readonly contentQueue: Queue<ContentGenerationJob>,
  ) {}

  /**
   * Add a content generation job to the queue with 60-second delay
   * @param data Job data containing content details
   * @returns Job with ID
   */
  async addContentGenerationJob(
    data: ContentGenerationJob,
  ): Promise<Job<ContentGenerationJob>> {
    const DELAY_MS = 60000; // 1 minute = 60000 milliseconds

    try {
      const job = await this.contentQueue.add('generate-content', data, {
        delay: DELAY_MS,
        jobId: `job-${data.contentId}-${Date.now()}`,
      });

      this.logger.log(
        `Job ${job.id} added to queue with ${DELAY_MS}ms delay for content ${data.contentId}`,
      );

      return job;
    } catch (error) {
      this.logger.error(
        `Failed to add job to queue for content ${data.contentId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get job status by ID
   * @param jobId Job identifier
   */
  async getJobStatus(jobId: string): Promise<Job<ContentGenerationJob> | null> {
    try {
      const job = await this.contentQueue.getJob(jobId);
      return job;
    } catch (error) {
      this.logger.error(`Failed to get job status for ${jobId}`, error);
      return null;
    }
  }

  /**
   * Get job by content ID (search through active jobs)
   * @param contentId Content identifier
   */
  async getJobByContentId(
    contentId: string,
  ): Promise<Job<ContentGenerationJob> | null> {
    try {
      const jobs = await this.contentQueue.getJobs([
        'waiting',
        'active',
        'delayed',
        'completed',
        'failed',
      ]);

      const job = jobs.find((j) => j.data.contentId === contentId);
      return job || null;
    } catch (error) {
      this.logger.error(
        `Failed to find job for content ${contentId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Remove a job from the queue
   * @param jobId Job identifier
   */
  async removeJob(jobId: string): Promise<void> {
    try {
      const job = await this.contentQueue.getJob(jobId);
      if (job) {
        await job.remove();
        this.logger.log(`Job ${jobId} removed from queue`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove job ${jobId}`, error);
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.contentQueue.getWaitingCount(),
      this.contentQueue.getActiveCount(),
      this.contentQueue.getCompletedCount(),
      this.contentQueue.getFailedCount(),
      this.contentQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}
