import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentResponseDto {
  @ApiProperty({
    description: 'Job ID for tracking content generation',
    example: 'job-123-456',
  })
  jobId: string;

  @ApiProperty({
    description: 'Content ID',
    example: '507f1f77bcf86cd799439011',
  })
  contentId: string;

  @ApiProperty({
    description: 'Message indicating job was queued',
    example: 'Content generation job queued successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Expected delay in milliseconds (60000 = 1 minute)',
    example: 60000,
  })
  delayMs: number;

  @ApiProperty({
    description: 'Estimated completion time',
    example: '2024-01-15T10:31:00Z',
  })
  estimatedCompletionTime: Date;
}
