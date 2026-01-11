# Swagger API Documentation

## Overview

Swagger/OpenAPI documentation has been integrated into the NestJS API with complete authentication support.

## Access Swagger UI

After starting the application, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

## Authentication in Swagger

The API uses JWT Bearer authentication. To test protected endpoints:

1. Register a new user or login at `/api/auth/register` or `/api/auth/login`
2. Copy the `access_token` from the response
3. Click the **"Authorize"** button at the top of Swagger UI
4. Paste the token (without "Bearer" prefix) and click "Authorize"
5. You can now test protected endpoints like `/api/auth/me`

## Configuration

The Swagger configuration is located in `src/main.ts`:

- **Title**: AI Content Creator API
- **Description**: API documentation for AI Content Creator
- **Version**: 1.0
- **Base Path**: `/api`
- **Documentation Path**: `/api/docs`
- **Authentication**: Bearer JWT

## Available Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account
- **Request**: RegisterDto (email, password, firstName, lastName)
- **Response**: User object + JWT access token
- **Status Codes**: 201 (Created), 400 (Bad Request), 409 (Conflict)

#### POST /api/auth/login
Authenticate and get JWT token
- **Request**: LoginDto (email, password)
- **Response**: User object + JWT access token
- **Status Codes**: 200 (OK), 400 (Bad Request), 401 (Unauthorized)

#### GET /api/auth/me (Protected)
Get current authenticated user
- **Headers**: Authorization: Bearer <token>
- **Response**: User object
- **Status Codes**: 200 (OK), 401 (Unauthorized)

### Health Endpoint

#### GET /api
Health check endpoint
- **Response**: Status, message, and timestamp
- **Status Code**: 200 (OK)

## Using Swagger Decorators

### Controller Example with Authentication

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GetUser } from './auth/decorators/get-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser() user) {
    return { message: `Hello ${user.firstName}` };
  }
}
```

### DTO Example with Validation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'user@example.com' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password (minimum 8 characters)', 
    example: 'SecurePass123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;
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
- `@ApiBearerAuth()` - Add JWT authentication requirement
- `@ApiUnauthorizedResponse()` - Document 401 responses
- `@ApiBadRequestResponse()` - Document 400 responses
- `@ApiConflictResponse()` - Document 409 responses

## Testing Protected Endpoints

Example workflow in Swagger UI:

1. Register a test user at POST /api/auth/register
2. Copy the access_token from response
3. Click the Authorize button and paste token
4. Test protected endpoint at GET /api/auth/me

## Benefits

1. **Interactive Testing**: Test API endpoints directly from the browser
2. **Authentication Support**: Test protected routes with JWT tokens
3. **Auto-generated**: Documentation updates automatically with code changes
4. **Type Safety**: TypeScript types are reflected in the documentation
5. **Client Generation**: Can generate client SDKs from the OpenAPI spec
6. **Validation Documentation**: Input validation rules are shown in the UI

## Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Auth Module README](./src/auth/README.md)
