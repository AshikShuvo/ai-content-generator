import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { blogPostTemplate } from './prompt-templates/blog-post.template';
import { productDescriptionTemplate } from './prompt-templates/product-description.template';
import { socialMediaCaptionTemplate } from './prompt-templates/social-media.template';

export enum ContentType {
  BLOG_POST = 'BLOG_POST',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  SOCIAL_MEDIA_CAPTION = 'SOCIAL_MEDIA_CAPTION',
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found in environment variables. AI features will not work.',
      );
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-1.5-flash-latest for faster, free-tier friendly responses
      // Alternative: 'gemini-pro' or 'gemini-1.5-pro-latest'
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      this.logger.log('Gemini AI initialized successfully');
    }
  }

  /**
   * Generate content using Google Gemini AI
   * @param prompt User's input prompt
   * @param contentType Type of content to generate
   * @returns Generated text content
   */
  async generateContent(
    prompt: string,
    contentType: ContentType,
  ): Promise<string> {
    if (!this.model) {
      throw new Error(
        'Gemini AI is not initialized. Please check GEMINI_API_KEY.',
      );
    }

    try {
      const fullPrompt = this.buildPrompt(prompt, contentType);

      this.logger.log(
        `Generating ${contentType} content for prompt: "${prompt.substring(0, 50)}..."`,
      );

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini API returned empty response');
      }

      this.logger.log(
        `Successfully generated ${text.length} characters of content`,
      );

      return text.trim();
    } catch (error) {
      this.logger.error(
        `Failed to generate content with Gemini: ${error.message}`,
        error.stack,
      );

      // Provide more specific error messages
      if (error.message.includes('API_KEY')) {
        throw new Error(
          'Invalid Gemini API key. Please check your configuration.',
        );
      } else if (error.message.includes('quota')) {
        throw new Error(
          'Gemini API quota exceeded. Please try again later.',
        );
      } else if (error.message.includes('SAFETY')) {
        throw new Error(
          'Content was blocked by safety filters. Please try a different prompt.',
        );
      }

      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Build the full prompt based on content type
   * @param userPrompt User's input
   * @param contentType Type of content
   * @returns Full formatted prompt
   */
  private buildPrompt(userPrompt: string, contentType: ContentType): string {
    switch (contentType) {
      case ContentType.BLOG_POST:
        return blogPostTemplate(userPrompt);
      case ContentType.PRODUCT_DESCRIPTION:
        return productDescriptionTemplate(userPrompt);
      case ContentType.SOCIAL_MEDIA_CAPTION:
        return socialMediaCaptionTemplate(userPrompt);
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Test the Gemini connection
   * @returns Test result
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.model) {
        return {
          success: false,
          message: 'Gemini AI not initialized - missing API key',
        };
      }

      const result = await this.model.generateContent(
        'Say "Hello, I am working!" in exactly those words.',
      );
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: `Gemini AI is working. Response: ${text}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Gemini AI test failed: ${error.message}`,
      };
    }
  }
}
