import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { CONTENT_QUEUE } from '../queue.constants';
import { ContentGenerationJob } from '../queue.service';
import { GeminiService } from '../../ai/gemini.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentStatus } from '../../content/enums/content-status.enum';
import { ContentType } from '../../content/enums/content-type.enum';

@Processor(CONTENT_QUEUE)
export class ContentQueueProcessor {
  private readonly logger = new Logger(ContentQueueProcessor.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Process content generation jobs after 60-second delay
   */
  @Process('generate-content')
  async handleContentGeneration(job: Job<ContentGenerationJob>) {
    this.logger.log(
      `Processing job ${job.id} for content ${job.data.contentId}`,
    );

    try {
      const { contentId, userId, prompt, contentType, title } = job.data;

      this.logger.log(
        `Starting content generation for user ${userId}, type: ${contentType}`,
      );

      // Update status to PROCESSING
      await this.prisma.content.update({
        where: { id: contentId },
        data: { status: ContentStatus.PROCESSING },
      });
      await job.progress(25);

      // Generate content using Gemini AI
      this.logger.log(`Calling Gemini AI for content ${contentId}...`);
      const generatedText = await this.geminiService.generateContent(
        prompt,
        contentType as ContentType,
      );

      await job.progress(75);

      // Update content with generated text and mark as COMPLETED
      await this.prisma.content.update({
        where: { id: contentId },
        data: {
          status: ContentStatus.COMPLETED,
          generatedText,
        },
      });

      await job.progress(100);

      this.logger.log(
        `Job ${job.id} completed successfully. Generated ${generatedText.length} characters`,
      );

      return {
        success: true,
        contentId,
        generatedTextLength: generatedText.length,
        message: 'Content generation completed',
      };
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed for content ${job.data.contentId}: ${error.message}`,
        error.stack,
      );

      // Update content status to FAILED with error message
      try {
        await this.prisma.content.update({
          where: { id: job.data.contentId },
          data: {
            status: ContentStatus.FAILED,
            errorMessage: error.message || 'Unknown error occurred during content generation',
          },
        });
      } catch (updateError) {
        this.logger.error(
          `Failed to update content status after error: ${updateError.message}`,
        );
      }

      throw error;
    }
  }
}
