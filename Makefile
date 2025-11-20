.PHONY: help build run test clean dev lint docker-build docker-run deploy

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Development environment started!"
	@echo "API: http://localhost:8080"
	@echo "Grafana: http://localhost:3000 (admin/admin)"

build: ## Build the application
	@echo "Building Novatra server..."
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/novatra-server ./cmd/api
	@echo "Build completed: bin/novatra-server"

run: build ## Run the application locally
	@echo "Starting Novatra server..."
	./bin/novatra-server

test: ## Run tests
	@echo "Running tests..."
	go test -v ./...

clean: ## Clean build artifacts
	@echo "Cleaning up..."
	rm -rf bin/
	docker-compose down -v
	@echo "Cleanup completed"

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t novatra:latest -f build/Dockerfile .
	@echo "Docker image built: novatra:latest"