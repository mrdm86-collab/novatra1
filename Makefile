.PHONY: help build run test clean dev lint docker-build docker-run deploy frontend-install frontend-dev frontend-build frontend-clean

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Backend Targets:"
	@echo "  dev                Start backend development environment"
	@echo "  build              Build backend application"
	@echo "  run                Run backend locally"
	@echo "  test               Run backend tests"
	@echo ""
	@echo "Frontend Targets:"
	@echo "  frontend-install   Install frontend dependencies"
	@echo "  frontend-dev        Start frontend development server"
	@echo "  frontend-build     Build frontend for production"
	@echo ""
	@echo "Docker Targets:"
	@echo "  docker-build       Build Docker image"
	@echo "  docker-run         Run Docker container"
	@echo ""
	@echo "Utility Targets:"
	@echo "  clean              Clean all build artifacts"
	@echo "  lint               Run linter"
	@echo "  deploy             Deploy to production"

# Backend targets
dev: ## Start backend development environment
	@echo "Starting backend development environment..."
	docker-compose up -d
	@echo "Backend services started!"
	@echo "API: http://localhost:8080"
	@echo "Grafana: http://localhost:3000 (admin/admin)"

build: ## Build the backend application
	@echo "Building Novatra backend..."
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/novatra-server ./cmd/api
	@echo "Backend build completed: bin/novatra-server"

run: build ## Run the backend application locally
	@echo "Starting Novatra backend server..."
	./bin/novatra-server

test: ## Run backend tests
	@echo "Running backend tests..."
	go test -v ./...

# Frontend targets
frontend-install: ## Install frontend dependencies
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Frontend dependencies installed"

frontend-dev: ## Start frontend development server
	@echo "Starting frontend development server..."
	cd frontend && npm run dev
	@echo "Frontend server started on http://localhost:5173"

frontend-build: ## Build frontend for production
	@echo "Building frontend for production..."
	cd frontend && npm run build
	@echo "Frontend build completed"

frontend-clean: ## Clean frontend build artifacts
	@echo "Cleaning frontend..."
	cd frontend && rm -rf dist node_modules/.cache

# Docker targets
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t novatra:latest -f build/Dockerfile .
	@echo "Docker image built: novatra:latest"

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	docker run -d --name novatra \
		-p 8080:8080 \
		-p 9090:9090 \
		-e NEON_DATABASE_URL="postgresql://neondb_owner:Wjp.941768583@ep-noisy-mountain-a4dckdrs-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
		novatra:latest

# Utility targets
lint: ## Run linter for both backend and frontend
	@echo "Running linter..."
	@echo "Backend lint..."
	golangci-lint run
	@echo "Frontend lint..."
	cd frontend && npm run lint

clean: ## Clean all build artifacts
	@echo "Cleaning up..."
	rm -rf bin/
	docker-compose down -v
	cd frontend && rm -rf dist node_modules/.cache
	@echo "Cleanup completed"

deploy: ## Deploy both backend and frontend to production
	@echo "Deploying to production..."
	@echo "Building backend..."
	make build
	@echo "Building frontend..."
	make frontend-build
	@echo "Deployment completed!"