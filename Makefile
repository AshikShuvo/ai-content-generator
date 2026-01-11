# Makefile for AI Content Creator Docker Operations

.PHONY: help build up down restart logs clean dev dev-down test

# Default target
help:
	@echo "🐳 AI Content Creator - Docker Commands"
	@echo ""
	@echo "Production Commands:"
	@echo "  make build      - Build production Docker image"
	@echo "  make up         - Start all services in production mode"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - Follow logs from all services"
	@echo "  make clean      - Stop services and remove volumes (⚠️  deletes data)"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev        - Start development environment with hot reload"
	@echo "  make dev-down   - Stop development environment"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make ps         - Show running containers"
	@echo "  make shell      - Open shell in app container"
	@echo "  make db-shell   - Open MongoDB shell"
	@echo "  make redis-cli  - Open Redis CLI"
	@echo "  make test       - Run tests in container"
	@echo "  make health     - Check health of services"
	@echo ""

# Production commands
build:
	@echo "🔨 Building production image..."
	docker build -t ai-content-creator:latest .

up:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started! Visit http://localhost:3000"

down:
	@echo "🛑 Stopping services..."
	docker-compose down

restart:
	@echo "🔄 Restarting services..."
	docker-compose restart

logs:
	@echo "📜 Following logs (Ctrl+C to exit)..."
	docker-compose logs -f

clean:
	@echo "⚠️  Cleaning up (this will delete volumes)..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up
	@echo "✅ Development servers started!"
	@echo "   API: http://localhost:3000"
	@echo "   Client: http://localhost:5173"

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

# Utility commands
ps:
	@echo "📊 Container status:"
	docker-compose ps

shell:
	@echo "🐚 Opening shell in app container..."
	docker-compose exec app sh

db-shell:
	@echo "🗄️  Opening MongoDB shell..."
	docker-compose exec mongodb mongosh ai-content-creator

redis-cli:
	@echo "📮 Opening Redis CLI..."
	docker-compose exec redis redis-cli

test:
	@echo "🧪 Running tests..."
	docker-compose exec app npm test

health:
	@echo "🏥 Checking service health..."
	@echo "\n📦 Containers:"
	@docker-compose ps
	@echo "\n🗄️  MongoDB:"
	@docker-compose exec mongodb mongosh --quiet --eval "db.adminCommand('ping')" || echo "❌ MongoDB not responding"
	@echo "\n📮 Redis:"
	@docker-compose exec redis redis-cli ping || echo "❌ Redis not responding"
	@echo "\n🌐 Application:"
	@curl -s http://localhost:3000/api > /dev/null && echo "✅ API is responding" || echo "❌ API not responding"

# Build and run in one command
run: build up
	@echo "✅ Application is running!"

# Quick restart with rebuild
rebuild: down build up
	@echo "✅ Rebuild complete!"
