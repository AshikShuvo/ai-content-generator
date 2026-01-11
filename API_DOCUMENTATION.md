# 📚 AI Content Creator - API Documentation

Complete API reference for the AI Content Creator application.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- Email: valid email format, unique
- Password: min 6 characters
- FirstName: min 2 characters
- LastName: min 2 characters

---

### Login User

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

### Get Current User

**GET** `/auth/me`

Get currently authenticated user details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## 📝 Content Endpoints

### Generate Content (Queue Job)

**POST** `/content/generate`

Queue a content generation job with 60-second delay.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Benefits of AI in Healthcare",
  "prompt": "Write about how artificial intelligence is transforming healthcare, including diagnosis, treatment, and patient care.",
  "contentType": "BLOG_POST"
}
```

**Content Types:**
- `BLOG_POST` - Blog post outline
- `PRODUCT_DESCRIPTION` - Product description
- `SOCIAL_MEDIA_CAPTION` - Social media caption

**Validation:**
- Title: 3-200 characters
- Prompt: 10-1000 characters
- ContentType: must be one of the enum values

**Response:** `202 Accepted`
```json
{
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "contentId": "507f1f77bcf86cd799439011",
  "message": "Content generation job queued successfully",
  "delayMs": 60000,
  "estimatedCompletionTime": "2024-01-15T10:31:00Z"
}
```

**Important:** Content is NOT generated immediately. The job is queued and will be processed after 60 seconds. Use the `jobId` to poll for status.

---

### Get Content Status

**GET** `/content/:jobId/status`

Check the status of a content generation job.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

**Status: PENDING**
```json
{
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "status": "PENDING",
  "contentId": "507f1f77bcf86cd799439011",
  "generatedText": null,
  "errorMessage": null,
  "estimatedCompletionTime": "2024-01-15T10:31:00Z"
}
```

**Status: PROCESSING**
```json
{
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "status": "PROCESSING",
  "contentId": "507f1f77bcf86cd799439011",
  "generatedText": null,
  "errorMessage": null,
  "estimatedCompletionTime": null
}
```

**Status: COMPLETED**
```json
{
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "status": "COMPLETED",
  "contentId": "507f1f77bcf86cd799439011",
  "generatedText": "# Benefits of AI in Healthcare...",
  "errorMessage": null,
  "estimatedCompletionTime": null
}
```

**Status: FAILED**
```json
{
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "status": "FAILED",
  "contentId": "507f1f77bcf86cd799439011",
  "generatedText": null,
  "errorMessage": "Gemini API quota exceeded",
  "estimatedCompletionTime": null
}
```

**Polling Recommendation:** Poll this endpoint every 5 seconds until status is COMPLETED or FAILED.

---

### List All Content

**GET** `/content`

Get paginated list of all user's content.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- `contentType` (optional): Filter by type (BLOG_POST, PRODUCT_DESCRIPTION, SOCIAL_MEDIA_CAPTION)

**Example:** `GET /content?page=1&limit=10&status=COMPLETED`

**Response:** `200 OK`
```json
{
  "contents": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "title": "Benefits of AI in Healthcare",
      "prompt": "Write about how AI...",
      "contentType": "BLOG_POST",
      "generatedText": "# Benefits of AI...",
      "status": "COMPLETED",
      "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
      "errorMessage": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:31:30Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### Get Single Content

**GET** `/content/:id`

Get details of a specific content item.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "Benefits of AI in Healthcare",
  "prompt": "Write about how AI...",
  "contentType": "BLOG_POST",
  "generatedText": "# Benefits of AI in Healthcare...",
  "status": "COMPLETED",
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "errorMessage": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:31:30Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Content with ID 507f1f77bcf86cd799439011 not found"
}
```

**Error Response:** `403 Forbidden`
```json
{
  "statusCode": 403,
  "message": "You do not have access to this content"
}
```

---

### Update Content

**PUT** `/content/:id`

Update content title or generated text.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Title",
  "generatedText": "Updated content text..."
}
```

**Both fields are optional. Send only fields you want to update.**

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "title": "Updated Title",
  "prompt": "Write about how AI...",
  "contentType": "BLOG_POST",
  "generatedText": "Updated content text...",
  "status": "COMPLETED",
  "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
  "errorMessage": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### Delete Content

**DELETE** `/content/:id`

Delete a content item.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

No response body.

---

### Search Content

**GET** `/content/search`

Search user's content by title.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Max results, default 10

**Example:** `GET /content/search?q=healthcare&limit=5`

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "Benefits of AI in Healthcare",
    "prompt": "Write about how AI...",
    "contentType": "BLOG_POST",
    "generatedText": "# Benefits of AI...",
    "status": "COMPLETED",
    "jobId": "job-507f1f77bcf86cd799439011-1705315800000",
    "errorMessage": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:30Z"
  }
]
```

---

### Get User Statistics

**GET** `/content/stats`

Get content statistics for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "total": 25,
  "pending": 2,
  "processing": 1,
  "completed": 20,
  "failed": 2
}
```

---

## 🚨 Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted, processing asynchronously
- `204 No Content` - Success, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., email already exists)
- `500 Internal Server Error` - Server error

---

## 📊 Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per user
- 10 content generation requests per hour per user
- Gemini API has its own rate limits

---

## 🔄 Content Generation Workflow

```
1. POST /content/generate
   ↓ Returns jobId immediately (202 Accepted)
   ↓
2. Poll GET /content/:jobId/status every 5 seconds
   ↓ Check status field
   ↓
3. Status progression:
   PENDING (queued, 60s delay)
     ↓
   PROCESSING (AI generating)
     ↓
   COMPLETED ✅ or FAILED ❌
   ↓
4. GET /content/:id to fetch full content details
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Generate Content
```bash
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Content",
    "prompt": "Write a test content piece",
    "contentType": "BLOG_POST"
  }'
```

### Check Status
```bash
curl http://localhost:3000/api/content/JOB_ID_HERE/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/api
```

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication with JWT
- Example values

---

## 🎯 Best Practices

1. **Always Poll**: Content generation is asynchronous. Always poll the status endpoint.
2. **Handle Errors**: Check for FAILED status and display error messages.
3. **Store Tokens Securely**: Never expose JWT tokens in client-side code.
4. **Pagination**: Use pagination for large datasets.
5. **Debounce Search**: Implement debouncing for search (300ms recommended).
6. **Token Refresh**: Implement token refresh logic for production.

---

For more information, see the main [README.md](README.md) or [PROJECT_SETUP.md](PROJECT_SETUP.md).
