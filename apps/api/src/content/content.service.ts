import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentStatus } from './enums/content-status.enum';
import { Content } from '@prisma/client';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new content entry
   */
  async create(userId: string, createContentDto: CreateContentDto): Promise<Content> {
    const content = await this.prisma.content.create({
      data: {
        userId,
        title: createContentDto.title,
        prompt: createContentDto.prompt,
        contentType: createContentDto.contentType,
        status: ContentStatus.PENDING,
      },
    });

    this.logger.log(`Content ${content.id} created for user ${userId}`);
    return content;
  }

  /**
   * Update content with job ID
   */
  async updateJobId(contentId: string, jobId: string): Promise<Content> {
    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: { jobId },
    });

    this.logger.log(`Content ${contentId} updated with jobId ${jobId}`);
    return content;
  }

  /**
   * Update content status
   */
  async updateStatus(
    contentId: string,
    status: ContentStatus,
    generatedText?: string,
    errorMessage?: string,
  ): Promise<Content> {
    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: {
        status,
        generatedText: generatedText || undefined,
        errorMessage: errorMessage || undefined,
      },
    });

    this.logger.log(`Content ${contentId} status updated to ${status}`);
    return content;
  }

  /**
   * Find content by job ID
   */
  async findByJobId(jobId: string): Promise<Content | null> {
    return this.prisma.content.findUnique({
      where: { jobId },
    });
  }

  /**
   * Find all content for a user with pagination
   */
  async findAllForUser(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      status?: ContentStatus;
      contentType?: string;
    },
  ): Promise<{ contents: Content[]; total: number }> {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.contentType) {
      where.contentType = options.contentType;
    }

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip: options?.skip || 0,
        take: options?.take || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);

    return { contents, total };
  }

  /**
   * Find one content by ID
   */
  async findOne(contentId: string, userId: string): Promise<Content> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }

    if (content.userId !== userId) {
      throw new ForbiddenException('You do not have access to this content');
    }

    return content;
  }

  /**
   * Update content
   */
  async update(
    contentId: string,
    userId: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    // Verify ownership
    await this.findOne(contentId, userId);

    const content = await this.prisma.content.update({
      where: { id: contentId },
      data: updateContentDto,
    });

    this.logger.log(`Content ${contentId} updated by user ${userId}`);
    return content;
  }

  /**
   * Delete content
   */
  async remove(contentId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(contentId, userId);

    await this.prisma.content.delete({
      where: { id: contentId },
    });

    this.logger.log(`Content ${contentId} deleted by user ${userId}`);
  }

  /**
   * Search content by title
   */
  async search(
    userId: string,
    query: string,
    limit: number = 10,
  ): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: {
        userId,
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [total, pending, processing, completed, failed] = await Promise.all([
      this.prisma.content.count({ where: { userId } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.PENDING } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.PROCESSING } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.COMPLETED } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.FAILED } }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
    };
  }
}
