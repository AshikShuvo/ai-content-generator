# Multi-stage build for AI Content Creator
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all files
COPY . .

# Install all dependencies (including dev dependencies for build)
RUN npm install && npm cache clean --force

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Create env file (NOTE: Use environment variables in production instead!)
# For Docker, use service names: redis (not localhost), mongodb (not localhost)
ARG DATABASE_URL
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_URL
ARG GEMINI_API_KEY
ARG PORT
ARG NODE_ENV
RUN echo "DATABASE_URL=${DATABASE_URL}" >> apps/api/.env && \
    echo "REDIS_HOST=${REDIS_HOST}" >> apps/api/.env && \
    echo "REDIS_PORT=${REDIS_PORT}" >> apps/api/.env && \
    echo "REDIS_URL=${REDIS_URL}" >> apps/api/.env && \
    echo "GEMINI_API_KEY=${GEMINI_API_KEY}" >> apps/api/.env && \
    echo "PORT=${PORT}" >> apps/api/.env && \
    echo "NODE_ENV=${NODE_ENV}" >> apps/api/.env

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages

# Copy API package files
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --workspace=api --omit=dev && npm cache clean --force

# Copy Prisma schema
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma client in production
WORKDIR /app/apps/api
RUN npx prisma generate

# Copy built files from builder stage
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/client/dist ../client/dist

# Copy .env file from builder (or use environment variables)
# NOTE: Environment variables from docker-compose will override .env file values
COPY --from=builder /app/apps/api/.env ./.env

# Environment variables set in docker-compose.yml will override .env file
# This ensures REDIS_HOST=redis from docker-compose takes precedence

# Set working directory to API
WORKDIR /app/apps/api

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the application
# Based on package.json: "start": "node apps/api/dist/src/main"
CMD ["node", "dist/src/main.js"]
