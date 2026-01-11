# Swagger API Documentation

## Overview

Swagger/OpenAPI documentation has been integrated into the NestJS API.

## Access Swagger UI

After starting the application, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

## Configuration

The Swagger configuration is located in `src/main.ts`:

- **Title**: AI Content Creator API
- **Description**: API documentation for AI Content Creator
- **Version**: 1.0
- **Base Path**: `/api`
- **Documentation Path**: `/api/docs`

## Using Swagger Decorators

### Controller Example

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')  // Groups endpoints in Swagger UI
@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  findAll() {
    // ...
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }
}
```

### DTO Example

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com' 
  })
  email: string;

  @ApiProperty({ 
    description: 'User first name', 
    example: 'John' 
  })
  firstName: string;
}
```

## Key Decorators

- `@ApiTags()` - Group related endpoints
- `@ApiOperation()` - Describe endpoint operation
- `@ApiResponse()` - Document response codes and types
- `@ApiProperty()` - Document DTO properties
- `@ApiParam()` - Document route parameters
- `@ApiQuery()` - Document query parameters
- `@ApiBody()` - Document request body
- `@ApiBearerAuth()` - Add authentication requirement

## Benefits

1. **Interactive Testing**: Test API endpoints directly from the browser
2. **Auto-generated**: Documentation updates automatically with code changes
3. **Type Safety**: TypeScript types are reflected in the documentation
4. **Client Generation**: Can generate client SDKs from the OpenAPI spec

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
