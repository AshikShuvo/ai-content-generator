import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../enums/content-type.enum';
import { ContentStatus } from '../enums/content-status.enum';

export class ContentResponseDto {
  @ApiProperty({
    description: 'Content ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who created the content',
    example: '507f1f77bcf86cd799439012',
  })
  userId: string;

  @ApiProperty({
    description: 'Content title',
    example: 'My Blog Post About AI',
  })
  title: string;

  @ApiProperty({
    description: 'Original prompt used for generation',
    example: 'Write about the benefits of artificial intelligence in healthcare',
  })
  prompt: string;

  @ApiProperty({
    description: 'Type of content',
    enum: ContentType,
    example: ContentType.BLOG_POST,
  })
  contentType: ContentType;

  @ApiProperty({
    description: 'Generated text content',
    example: 'Here is the AI-generated content...',
    nullable: true,
  })
  generatedText: string | null;

  @ApiProperty({
    description: 'Current status of content generation',
    enum: ContentStatus,
    example: ContentStatus.COMPLETED,
  })
  status: ContentStatus;

  @ApiProperty({
    description: 'Job ID for tracking generation progress',
    example: 'job-123-456',
    nullable: true,
  })
  jobId: string | null;

  @ApiProperty({
    description: 'Error message if generation failed',
    nullable: true,
  })
  errorMessage: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:31:00Z',
  })
  updatedAt: Date;
}
