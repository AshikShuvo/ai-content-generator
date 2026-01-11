import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../enums/content-type.enum';

export class CreateContentDto {
  @ApiProperty({
    description: 'Title for the content',
    example: 'My Blog Post About AI',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Prompt or topic for content generation',
    example: 'Write about the benefits of artificial intelligence in healthcare',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  prompt: string;

  @ApiProperty({
    description: 'Type of content to generate',
    enum: ContentType,
    example: ContentType.BLOG_POST,
  })
  @IsEnum(ContentType)
  @IsNotEmpty()
  contentType: ContentType;
}
