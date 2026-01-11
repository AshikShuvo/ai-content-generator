import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '../enums/content-status.enum';

export class ContentStatusDto {
  @ApiProperty({
    description: 'Job ID',
    example: 'job-123-456',
  })
  jobId: string;

  @ApiProperty({
    description: 'Current status',
    enum: ContentStatus,
    example: ContentStatus.PROCESSING,
  })
  status: ContentStatus;

  @ApiProperty({
    description: 'Content ID if available',
    example: '507f1f77bcf86cd799439011',
    nullable: true,
  })
  contentId: string | null;

  @ApiProperty({
    description: 'Generated text if completed',
    nullable: true,
  })
  generatedText: string | null;

  @ApiProperty({
    description: 'Error message if failed',
    nullable: true,
  })
  errorMessage: string | null;

  @ApiProperty({
    description: 'Expected completion time for pending jobs',
    nullable: true,
  })
  estimatedCompletionTime: Date | null;
}
