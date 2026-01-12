# Multi-stage build for AI Content Creator Monorepo
# This Dockerfile builds both client and API in a single image

# Stage 1: Build the client (React Vite app)
FROM node:20-alpine AS client-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages

# Copy client package files first
COPY apps/client/package*.json ./apps/client/

# Copy all client files (including tsconfig, vite.config, etc.)
COPY apps/client ./apps/client

# Install dependencies (including workspace dependencies)
RUN npm ci --workspace=client

# Build the client
WORKDIR /app/apps/client
RUN npm run build

# Stage 2: Build the API (NestJS)
FROM node:20-alpine AS api-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages

# Copy API package files
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api ./apps/api

# Install dependencies (including workspace dependencies)
RUN npm ci --workspace=api

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the API
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy root package files
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs turbo.json ./

# Copy workspace packages
COPY --chown=nestjs:nodejs packages ./packages

# Copy API package files
COPY --chown=nestjs:nodejs apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --workspace=api --omit=dev && \
    npm cache clean --force

# Copy Prisma schema and generate client
COPY --chown=nestjs:nodejs apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
RUN npx prisma generate

# Copy built API from builder
COPY --chown=nestjs:nodejs --from=api-builder /app/apps/api/dist ./dist

# Copy built client from client-builder to be served by NestJS
COPY --chown=nestjs:nodejs --from=client-builder /app/apps/client/dist ../client/dist

# Set working directory to API
WORKDIR /app/apps/api

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
