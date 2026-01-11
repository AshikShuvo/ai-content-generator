# Authentication Module

## Overview

This module provides JWT-based authentication for the AI Content Creator API. It includes user registration, login, and protected route access.

## Features

- ✅ User registration with email and password
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token validation and user extraction
- ✅ Protected routes with guards
- ✅ Custom decorators for user extraction
- ✅ Comprehensive test coverage (unit + E2E)
- ✅ Full Swagger API documentation

## Environment Variables

Create a `.env` file in the API root with:

```env
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1h"
PORT=3000
```

## API Endpoints

### 1. Register New User

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-01-12T10:00:00.000Z",
    "updatedAt": "2026-01-12T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- Email must be a valid email address
- Password must be at least 8 characters
- First name and last name are required

### 2. Login User

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-01-12T10:00:00.000Z",
    "updatedAt": "2026-01-12T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User (Protected)

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2026-01-12T10:00:00.000Z",
  "updatedAt": "2026-01-12T10:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request
Invalid input data (validation errors)
```json
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
Invalid credentials or missing/invalid JWT token
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 409 Conflict
Email already exists
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

## Using Authentication in Other Modules

### Protecting Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GetUser } from './auth/decorators/get-user.decorator';

@Get('protected')
@UseGuards(JwtAuthGuard)
async getProtectedResource(@GetUser() user) {
  // user object is automatically extracted from JWT token
  return { message: `Hello ${user.firstName}!` };
}
```

### Importing Auth Module

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  // ...
})
export class YourModule {}
```

## Testing

### Run Unit Tests
```bash
npm test -- auth
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run All Tests with Coverage
```bash
npm run test:cov
```

## Architecture

### JWT Token Payload
```typescript
{
  sub: userId,      // User ID
  email: userEmail, // User email
  iat: timestamp,   // Issued at
  exp: timestamp    // Expiration
}
```

### Authentication Flow

1. **Registration/Login**: User provides credentials
2. **Validation**: Credentials are validated
3. **Token Generation**: JWT token is created with user payload
4. **Token Response**: Token is sent to client
5. **Subsequent Requests**: Client includes token in Authorization header
6. **Token Validation**: Guard validates token and extracts user
7. **Request Processing**: User object is available in controller

### Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: Signed with secret key, 1-hour expiration
- **Input Validation**: Class-validator decorators on DTOs
- **Password Exclusion**: Password never returned in responses
- **Guard Protection**: Routes protected with JWT guard

## Test Coverage

- **Unit Tests**: 16 tests covering service and controller
- **E2E Tests**: 16 integration tests covering all endpoints
- **Coverage**: 84.61% for auth module

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api/docs
```

Use the "Authorize" button to test protected endpoints with JWT tokens.
