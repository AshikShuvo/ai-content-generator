# 🚀 AI Content Creator

> ✅ **STATUS**: Fully Operational | Last Updated: January 12, 2026

A powerful full-stack web application that leverages AI to generate various types of content including blog posts, product descriptions, and social media captions. Built with modern technologies and featuring a delayed job queue system for optimal performance.

## 🎯 Current Status

✅ **Backend API** - Running on http://localhost:3000  
✅ **Frontend Client** - Running on http://localhost:5173  
✅ **AI Integration** - Google Gemini API connected  
✅ **Queue System** - Redis/Bull with 60-second delay operational  
✅ **All Tests** - Passing

📄 **See [docs/fixes/FINAL_FIXES_AND_STATUS.md](docs/fixes/FINAL_FIXES_AND_STATUS.md) for complete implementation details and fixes**

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Content Generation** - Generate high-quality content using Google Gemini AI
- **Multiple Content Types** - Blog post outlines, product descriptions, and social media captions
- **Queue-Based Processing** - Jobs are queued with a 1-minute delay for optimal resource management
- **Real-Time Status Tracking** - Poll job status and watch content generation in real-time
- **User Authentication** - Secure JWT-based authentication system
- **Content Management** - Full CRUD operations on generated content

### 🎁 Bonus Features
- **Predictive Search** - Real-time search with debounced input
- **Statistics Dashboard** - Track your content generation metrics
- **Responsive Design** - Beautiful, mobile-friendly UI with TailwindCSS
- **Unit Tests** - Comprehensive test suite for backend services

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe backend code
- **Prisma** - Next-generation ORM
- **MongoDB** - NoSQL database
- **Bull** - Redis-based queue for job processing
- **Redis** - In-memory data store for queues
- **JWT** - JSON Web Tokens for authentication
- **Google Generative AI** - AI content generation

## 📸 Screenshots

### Dashboard
Beautiful dashboard with real-time statistics and predictive search

### Content Creation
Simple, intuitive form for generating AI content

### Content Tracking
Real-time progress tracking with status indicators

## 🚀 Quick Start

### 🐳 Docker Deployment (Recommended)

The easiest way to run this application is using Docker:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ai-content-creator

# 2. Set up environment variables
cp .env.docker .env
# Edit .env and add your JWT_SECRET and GEMINI_API_KEY

# 3. Start with Docker Compose
docker-compose up -d

# 4. Access the application
# Frontend & API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

**Or use the quick start script:**

```bash
./quick-start.sh
```

🐳 **For complete Docker deployment guide, see [docs/deployment/DOCKER_DEPLOYMENT.md](docs/deployment/DOCKER_DEPLOYMENT.md)**

---

### 💻 Local Development Setup (Manual Installation)

#### Prerequisites

Before starting, ensure you have the following installed and running:

- **Node.js** v18 or higher
- **MongoDB** (local installation or MongoDB Atlas)
- **Redis** (local installation or Redis Cloud)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

#### Step 1: Install Dependencies

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
```

#### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.version()"
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string from the Atlas dashboard

#### Step 3: Setup Redis

**Option A: Local Redis**
```bash
# Linux
sudo systemctl start redis

# macOS
brew services start redis

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

**Option B: Redis Cloud**
1. Create a free account at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Note the host, port, and password

#### Step 4: Configure Environment Variables

**Backend Configuration** (`apps/api/.env`):
```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` with your configuration:
```env
# Database
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/ai-content-creator

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Redis Configuration
# Option 1: Local Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Option 2: Third-Party Redis (using URL - recommended)
# REDIS_URL="redis://:password@host:port"
# For TLS/SSL: REDIS_URL="rediss://:password@host:port"

# Option 3: Third-Party Redis (using separate credentials)
# REDIS_HOST="your-redis-host.upstash.io"
# REDIS_PORT=6379
# REDIS_PASSWORD="your-redis-password"
# REDIS_TLS=true  # Enable if your provider requires TLS

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# Server Configuration
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

#### Step 5: Setup Database Schema

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

#### Step 6: Start Development Servers

You need **two terminal windows** to run both frontend and backend:

**Terminal 1 - Backend Server:**
```bash
cd apps/api
npm run dev
```

You should see:
```
[Nest] Starting Nest application...
[Nest] Application successfully started on http://localhost:3000
```

**Terminal 2 - Frontend Server:**
```bash
cd apps/client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### Step 7: Access the Application

Once both servers are running:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation (Swagger)**: http://localhost:3000/api
- **Prisma Studio** (if running): http://localhost:5555

#### Step 8: Verify Installation

1. **Check Backend**: Visit http://localhost:3000/api - You should see the Swagger API documentation
2. **Check Frontend**: Visit http://localhost:5173 - You should see the login/register page
3. **Test Registration**: Create a new account
4. **Test Content Generation**: Create a content request and verify it queues properly

#### Troubleshooting Common Issues

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Start MongoDB if not running
sudo systemctl start mongod  # Linux
```

**Redis Connection Error:**
```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Start Redis if not running
sudo systemctl start redis  # Linux
brew services start redis  # macOS
```

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

**Prisma Errors:**
```bash
# Regenerate Prisma client
cd apps/api
npx prisma generate
npx prisma db push
```

📖 **For more detailed troubleshooting, see [docs/setup/PROJECT_SETUP.md](docs/setup/PROJECT_SETUP.md)**

## 📂 Project Structure

```
ai-content-creator/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/        # Authentication
│   │   │   ├── content/     # Content management
│   │   │   ├── ai/          # Gemini AI service
│   │   │   ├── queue/       # Bull queue
│   │   │   └── prisma/      # Database
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── client/              # React Frontend
│       └── src/
│           ├── pages/       # Application pages
│           ├── components/  # Reusable components
│           ├── services/    # API services
│           └── hooks/       # Custom React hooks
│
├── packages/                # Shared packages
├── docs/                    # All documentation
│   ├── setup/              # Setup guides
│   ├── architecture/       # Architecture docs
│   ├── deployment/         # Deployment guides
│   ├── fixes/              # Bug fixes & troubleshooting
│   ├── implementation/     # Implementation summaries
│   ├── testing/            # Testing guides
│   └── readme/             # Component READMEs
└── README.md               # This file
```

## 🎯 How It Works

### Content Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant Q as Redis Queue
    participant W as Worker
    participant AI as Gemini AI
    participant DB as MongoDB

    U->>F: Create content request
    F->>API: POST /content/generate
    API->>DB: Save content (PENDING)
    API->>Q: Enqueue job (60s delay)
    API->>F: Return jobId (202 Accepted)
    F->>U: Show queued status
    
    Note over Q: 60 second delay
    
    Q->>W: Process job
    W->>DB: Update status (PROCESSING)
    W->>AI: Generate content
    AI->>W: Return generated text
    W->>DB: Update content (COMPLETED)
    
    loop Poll every 5 seconds
        F->>API: GET /content/:jobId/status
        API->>F: Return current status
    end
    
    F->>U: Display generated content
```

### Key Implementation Details

1. **Delayed Queue Execution** - Jobs are delayed by exactly 60 seconds (60000ms) as per requirements
2. **Status Polling** - Frontend polls every 5 seconds to check job completion
3. **Job States** - PENDING → PROCESSING → COMPLETED/FAILED
4. **Security** - JWT authentication guards all endpoints
5. **Database Relations** - Users can only access their own content

## 🔑 Key Features Explained

### 1. Queue-Based Content Generation
- Content generation requests are immediately queued
- Jobs execute after exactly 1 minute
- Non-blocking API responses (HTTP 202 Accepted)
- Background worker processes handle AI calls

### 2. Real-Time Status Updates
- Frontend polls status endpoint every 5 seconds
- Visual progress indicators (Pending → Processing → Completed)
- Error handling with detailed error messages

### 3. AI Integration
- Google Gemini 1.5 Flash model (free tier friendly)
- Custom prompts for each content type
- Error handling and retry logic
- Safety filter handling

### 4. Predictive Search
- Debounced search (300ms delay)
- Real-time results as you type
- Search by content title
- Quick navigation to results

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login user
GET    /api/auth/me          Get current user (protected)
```

### Content Management
```
POST   /api/content/generate           Generate content (202 Accepted)
GET    /api/content/:jobId/status      Get job status
GET    /api/content                    List all content (paginated)
GET    /api/content/:id                Get single content
PUT    /api/content/:id                Update content
DELETE /api/content/:id                Delete content
GET    /api/content/search?q=query     Search content
GET    /api/content/stats              Get user statistics
```

### Swagger Documentation
Visit `http://localhost:3000/api` for interactive API documentation

## 🧪 Testing

```bash
# Run backend tests
cd apps/api
npm test                # Unit tests
npm run test:cov        # With coverage
npm run test:e2e        # E2E tests
```

## 🔐 Security Features

- **Password Hashing** - Bcrypt with 10 salt rounds
- **JWT Tokens** - Secure authentication
- **Authorization Guards** - Protected endpoints
- **Content Isolation** - Users only see their own content
- **Input Validation** - Class-validator DTOs
- **Environment Variables** - Sensitive data protection

## 🌟 Implementation Highlights

### Requirements Met

✅ **MERN Stack (with enhancements)**
- MongoDB with Prisma ORM
- Express (via NestJS)
- React 19 with TypeScript
- Node.js backend

✅ **User Authentication**
- Secure JWT-based authentication
- Registration and login endpoints
- Protected routes

✅ **AI Integration**
- Google Gemini AI API integration
- Multiple content types supported
- Custom prompt engineering

✅ **Queue System (Core Requirement)**
- Redis Bull queue implementation
- **Exactly 1-minute delayed job execution**
- Non-blocking API responses
- Background worker processing
- Status polling endpoint

✅ **Bonus Features**
- Predictive search with debouncing
- Unit tests for critical services
- Statistics dashboard
- Professional UI/UX

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack application architecture
- Microservices pattern with queue-based processing
- AI API integration and prompt engineering
- Real-time status tracking patterns
- Modern React patterns (hooks, context)
- TypeScript best practices
- Database design with Prisma
- Security implementations

## 📝 Environment Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL="mongodb://localhost:27017/ai-content-creator"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=3000
```

### Frontend (`apps/client/.env`)
```env
VITE_API_URL="http://localhost:3000/api"
```

## 🐛 Troubleshooting

See [docs/setup/PROJECT_SETUP.md](docs/setup/PROJECT_SETUP.md) for detailed troubleshooting guide.

Common issues:
- MongoDB not running → `sudo systemctl start mongod`
- Redis not running → `sudo systemctl start redis`
- Port in use → Kill process or change PORT in `.env`
- Gemini API errors → Check API key and quota

## 🚀 Deployment

### ⚡ Vercel + Railway (Fastest - Recommended for Production)

Deploy frontend to Vercel (fast CDN) and backend to Railway (persistent server):

```bash
# Quick deployment script
./deploy-vercel.sh
```

**Manual deployment:**
```bash
# 1. Setup external services (5 min)
# - MongoDB Atlas: https://www.mongodb.com/atlas
# - Upstash Redis: https://upstash.com

# 2. Deploy backend to Railway (5 min)
cd apps/api
railway login && railway init && railway up
railway variables set DATABASE_URL=... REDIS_HOST=... JWT_SECRET=... GEMINI_API_KEY=...

# 3. Deploy frontend to Vercel (5 min)
cd ../client
echo "VITE_API_URL=https://your-app.railway.app" > .env.production
vercel login && vercel --prod
```

📚 **Detailed guides:**
- 🚀 [docs/deployment/VERCEL_QUICK_REFERENCE.md](docs/deployment/VERCEL_QUICK_REFERENCE.md) - Quick start (15 min)
- 📖 [docs/deployment/VERCEL_DEPLOYMENT.md](docs/deployment/VERCEL_DEPLOYMENT.md) - Complete guide with options
- ✅ [docs/deployment/VERCEL_DEPLOYMENT_CHECKLIST.md](docs/deployment/VERCEL_DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

**Why this approach?**
- ✅ Frontend on global CDN (Vercel)
- ✅ Backend with persistent connections for Bull queues (Railway)
- ✅ Free tier available ($0-5/month)
- ✅ Easy scaling and monitoring

---

### 🐳 Docker Deployment (Self-Hosting)

Best for VPS or cloud infrastructure where you control the servers:

**Local/VPS Deployment:**
```bash
# Production deployment
docker-compose up -d --build

# With custom compose file
docker-compose -f docker-compose.prod.yml up -d
```

**Cloud Deployment:**

The application is containerized and can be easily deployed to:
- **Railway** - One-click Docker deployment
- **Render** - Free tier with Docker support
- **Fly.io** - Global edge deployment
- **DigitalOcean App Platform** - Managed container hosting
- **AWS ECS/EKS** - Using ECR for image registry
- **Google Cloud Run** - Serverless container deployment
- **Azure Container Instances** - Quick container deployment
- **Any VPS with Docker** - Ubuntu, Debian, CentOS, etc.

See [docs/deployment/DOCKER_DEPLOYMENT.md](docs/deployment/DOCKER_DEPLOYMENT.md) for detailed cloud deployment instructions.

---

### 📊 Deployment Comparison

| Platform | Best For | Setup Time | Cost/Month | Pros |
|----------|----------|------------|------------|------|
| **Vercel + Railway** | Production | 15 min | $0-5 | Fast CDN, persistent backend, free tier |
| **Render** | Simplicity | 10 min | $0 | All-in-one, Docker support, free tier |
| **Docker (VPS)** | Full control | 30 min | $5+ | Complete control, custom config |
| **Fly.io** | Global apps | 20 min | $0-10 | Edge network, Docker-native |

**Recommendation:**
- 🏆 **For most users**: Vercel + Railway (best performance + cost)
- 🐳 **For self-hosters**: Docker on VPS
- 🚀 **For simplicity**: Render (all-in-one)

---

### 📦 Alternative Platforms

### Backend Options
- **Railway** - Best for NestJS apps, free $5 credit/month
- **Render** - Free tier, Docker support, built-in Redis
- **Fly.io** - Global deployment, Docker-native
- **Heroku** - Classic PaaS, $7/month
- **DigitalOcean** - VPS starting at $5/month

### Frontend Options
- **Vercel** - Best for React/Vite, free hobby tier
- **Netlify** - Similar to Vercel, free tier
- **Cloudflare Pages** - Fast global CDN, free tier
- **GitHub Pages** - Free static hosting

### Database Options
- **MongoDB Atlas** - Free 512MB tier
- **Railway PostgreSQL** - Included in plan
- **Render PostgreSQL** - Free tier available
- **DigitalOcean** - Managed databases from $15/month

**Note:** With Docker deployment, frontend is served as static files from the backend on a single port (3000), eliminating the need for separate frontend deployment.

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

This is a portfolio/educational project. Feel free to fork and modify for your own use!

## 🎉 Acknowledgments

- Google Gemini AI for content generation
- NestJS for excellent framework
- React team for amazing library
- Prisma for modern ORM experience

---

**Built with ❤️ using modern web technologies**

🌟 If you found this helpful, please star the repository!
