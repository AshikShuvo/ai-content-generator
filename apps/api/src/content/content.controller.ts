import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { QueueService } from '../queue/queue.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { ContentStatusDto } from './dto/content-status.dto';
import { GenerateContentResponseDto } from './dto/generate-content-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ContentStatus } from './enums/content-status.enum';

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly queueService: QueueService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Generate content using AI (queued with 1-minute delay)',
  })
  @ApiResponse({
    status: 202,
    description: 'Content generation job queued successfully',
    type: GenerateContentResponseDto,
  })
  async generateContent(
    @GetUser('id') userId: string,
    @Body() createContentDto: CreateContentDto,
  ): Promise<GenerateContentResponseDto> {
    // Create content entry in database
    const content = await this.contentService.create(userId, createContentDto);

    // Add job to queue with 60-second delay
    const job = await this.queueService.addContentGenerationJob({
      contentId: content.id,
      userId: userId,
      prompt: createContentDto.prompt,
      contentType: createContentDto.contentType,
      title: createContentDto.title,
    });

    // Update content with job ID
    await this.contentService.updateJobId(content.id, job.id.toString());

    const estimatedCompletionTime = new Date(Date.now() + 60000);

    return {
      jobId: job.id.toString(),
      contentId: content.id,
      message: 'Content generation job queued successfully',
      delayMs: 60000,
      estimatedCompletionTime,
    };
  }

  @Get(':jobId/status')
  @ApiOperation({ summary: 'Get content generation status by job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved',
    type: ContentStatusDto,
  })
  async getContentStatus(
    @Param('jobId') jobId: string,
    @GetUser('id') userId: string,
  ): Promise<ContentStatusDto> {
    // Find content by job ID
    const content = await this.contentService.findByJobId(jobId);

    if (!content) {
      // Job might still be in queue, check queue
      const job = await this.queueService.getJobStatus(jobId);

      if (!job) {
        return {
          jobId,
          status: ContentStatus.FAILED,
          contentId: null,
          generatedText: null,
          errorMessage: 'Job not found',
          estimatedCompletionTime: null,
        };
      }

      const state = await job.getState();
      let status: ContentStatus;

      if (state === 'delayed' || state === 'waiting') {
        status = ContentStatus.PENDING;
      } else if (state === 'active') {
        status = ContentStatus.PROCESSING;
      } else if (state === 'completed') {
        status = ContentStatus.COMPLETED;
      } else {
        status = ContentStatus.FAILED;
      }

      return {
        jobId,
        status,
        contentId: job.data.contentId,
        generatedText: null,
        errorMessage: null,
        estimatedCompletionTime:
          state === 'delayed'
            ? new Date(job.processedOn! + job.opts.delay!)
            : null,
      };
    }

    // Verify user owns this content
    if (content.userId !== userId) {
      return {
        jobId,
        status: ContentStatus.FAILED,
        contentId: null,
        generatedText: null,
        errorMessage: 'Unauthorized',
        estimatedCompletionTime: null,
      };
    }

    return {
      jobId: content.jobId || jobId,
      status: content.status as ContentStatus,
      contentId: content.id,
      generatedText: content.generatedText,
      errorMessage: content.errorMessage,
      estimatedCompletionTime: null,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all content for authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ContentStatus })
  @ApiQuery({ name: 'contentType', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Content list retrieved',
    type: [ContentResponseDto],
  })
  async findAll(
    @GetUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ContentStatus,
    @Query('contentType') contentType?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const skip = (pageNum - 1) * limitNum;

    const { contents, total } = await this.contentService.findAllForUser(
      userId,
      {
        skip,
        take: limitNum,
        status,
        contentType,
      },
    );

    return {
      contents,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search content by title' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [ContentResponseDto],
  })
  async search(
    @GetUser('id') userId: string,
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = parseInt(limit || '10', 10);
    return this.contentService.search(userId, query, limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user content statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved',
  })
  async getStats(@GetUser('id') userId: string) {
    return this.contentService.getUserStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single content by ID' })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved',
    type: ContentResponseDto,
  })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.contentService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({
    status: 200,
    description: 'Content updated',
    type: ContentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentService.update(id, userId, updateContentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete content' })
  @ApiResponse({
    status: 204,
    description: 'Content deleted',
  })
  async remove(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<void> {
    return this.contentService.remove(id, userId);
  }
}
