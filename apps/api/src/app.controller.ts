import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns application health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        message: {
          type: 'string',
          example: 'AI Content Creator API is running',
        },
        timestamp: { type: 'string', example: '2026-01-12T01:00:00.000Z' },
      },
    },
  })
  getHello() {
    return {
      status: 'ok',
      message: this.appService.getHello(),
      timestamp: new Date().toISOString(),
    };
  }
}
