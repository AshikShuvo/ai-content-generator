# AI Content Creator - Complete Setup Guide

## 🚀 Quick Start

This is a full-stack AI Content Creator application built with NestJS, React, MongoDB, Redis, and Google Gemini AI.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Redis** (local or Redis Cloud)
- **Google Gemini API Key** (Get from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if applicable)
cd ai-content-creator

# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../client
npm install

cd ../..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string

### 3. Setup Redis

**Option A: Local Redis**
```bash
# Start Redis service
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

**Option B: Redis Cloud / Third-Party Redis**
1. Create account at a Redis provider (e.g., [Upstash](https://upstash.com), [Redis Cloud](https://redis.com/try-free/))
2. Create a new Redis database
3. Get your Redis connection details:
   - **Option 1 (Recommended)**: Full Redis URL (e.g., `redis://:password@host:port` or `rediss://:password@host:port` for TLS)
   - **Option 2**: Separate host, port, and password

### 4. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key

### 5. Configure Environment Variables

**Backend Configuration** (`apps/api/.env`):
```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env`:

**For Local Redis:**
```env
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REDIS_HOST="localhost"
REDIS_PORT=6379
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
NODE_ENV="development"
```

**For Third-Party Redis (Option 1 - Using Redis URL):**
```env
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
# Use full Redis URL (recommended for third-party services)
REDIS_URL="redis://:your-password@your-redis-host:6379"
# For TLS/SSL connections (rediss://)
# REDIS_URL="rediss://:your-password@your-redis-host:6380"
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
NODE_ENV="development"
```

**For Third-Party Redis (Option 2 - Using Separate Credentials):**
```env
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REDIS_HOST="your-redis-host.upstash.io"
REDIS_PORT=6379
REDIS_PASSWORD="your-redis-password"
# Enable TLS if your provider requires it
# REDIS_TLS=true
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
NODE_ENV="development"
```

**Frontend Configuration** (`apps/client/.env`):
```bash
cd apps/client
cp .env.example .env
```

Edit `apps/client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 6. Run Database Migrations

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 7. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd apps/client
npm run dev
```

The application should now be running:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

## 🎯 Features Implemented

### Core Features (Mandatory)
✅ User registration and login with JWT authentication
✅ MongoDB database with Prisma ORM
✅ Secure RESTful APIs for CRUD operations
✅ AI content generation using Google Gemini
✅ Redis queue with 60-second delayed job execution
✅ Status polling for job progress
✅ Responsive UI with React + TailwindCSS

### Content Types
✅ Blog Post Outline
✅ Product Description
✅ Social Media Caption

### Bonus Features
✅ Predictive search with debounced input
✅ Unit tests for backend services
✅ Professional UI/UX design
✅ Real-time statistics dashboard

## 📖 Usage Guide

### 1. Register an Account
- Navigate to http://localhost:5173
- Click "Register" and create an account
- You'll be automatically logged in

### 2. Create Content
- Click "Create New Content" button
- Fill in:
  - Title (e.g., "Benefits of AI in Healthcare")
  - Content Type (Blog Post, Product Description, or Social Media)
  - Prompt (detailed description of what you want)
- Click "Generate Content"

### 3. Track Generation Progress
- You'll be redirected to a tracking page
- The system shows:
  - **Pending**: Job is queued (60-second delay)
  - **Processing**: AI is generating content
  - **Completed**: Content ready!
  - **Failed**: Error occurred (check error message)

### 4. View and Edit Content
- View all generated content in the "Content List"
- Click on any content to view details
- Edit generated text as needed
- Delete unwanted content

### 5. Search Content
- Use the search bar on Dashboard
- Real-time search results as you type
- Filters by title

## 🏗️ Project Structure

```
ai-content-creator/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── content/        # Content CRUD module
│   │   │   ├── ai/             # Gemini AI integration
│   │   │   ├── queue/          # Bull queue module
│   │   │   └── prisma/         # Database module
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── .env                # Backend config
│   │
│   └── client/                 # React Frontend
│       ├── src/
│       │   ├── pages/          # Route pages
│       │   ├── components/     # Reusable components
│       │   ├── services/       # API services
│       │   ├── contexts/       # React contexts
│       │   └── hooks/          # Custom hooks
│       └── .env                # Frontend config
│
└── package.json                # Root package.json
```

## 🧪 Testing

### Run Backend Tests
```bash
cd apps/api
npm test                # Run all tests
npm run test:cov        # With coverage
npm run test:e2e        # E2E tests
```

### Test API with Swagger
Visit http://localhost:3000/api for interactive API documentation

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `.env`
- For Atlas, ensure IP is whitelisted

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` (should return "PONG")
- Check REDIS_HOST and REDIS_PORT in `.env`

### Gemini API Issues
- Verify API key is correct
- Check quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure no rate limiting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Content
- `POST /api/content/generate` - Generate content (202 Accepted)
- `GET /api/content/:jobId/status` - Get job status
- `GET /api/content` - List all content (with pagination)
- `GET /api/content/:id` - Get single content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `GET /api/content/search?q=query` - Search content
- `GET /api/content/stats` - Get statistics

## 🎨 Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios

**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- MongoDB
- Bull Queue
- Redis
- JWT Authentication
- Google Generative AI

## 🔐 Security Notes

- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt (10 rounds)
- All content endpoints require authentication
- Users can only access their own content
- API keys should never be committed to Git

## 📝 Environment Variables Reference

See `.env.example` files in `apps/api/` and `apps/client/` for all required variables.

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect Railway/Render to repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `apps/client/dist` folder
3. Set VITE_API_URL to production API URL

## 📞 Support

For issues, please check:
1. All services (MongoDB, Redis) are running
2. Environment variables are correctly set
3. Dependencies are installed
4. Ports are not in use

## 🎉 Success!

If everything is set up correctly, you should be able to:
1. Register and login
2. Create content requests
3. See them queued (1-minute delay)
4. Watch AI generate content
5. View, edit, and manage all content

Happy content creating! 🚀
