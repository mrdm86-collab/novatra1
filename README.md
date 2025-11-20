# Novatra Universal Repository

Next-generation artifact repository management with AI-powered features.

## Features

- 🚀 High-performance Rust + Go hybrid architecture
- 🔒 Zero-trust security with end-to-end encryption
- 🔍 Vector search with semantic capabilities
- 🤖 AI-powered recommendations and anomaly detection
- ☁️ Cloud-native with Kubernetes support
- 📊 Real-time monitoring and observability
- 🔐 Multi-factor authentication and RBAC

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mrdm86/novatra1.git
cd novatra1

# Build and run
make build
make run
```

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Go 1.23+
- Node.js 20+

### Local Development
```bash
# Start all services (includes database, redis, monitoring)
make dev

# Or start manually
./start-novatra.bat  # Windows
./scripts/start.sh   # Linux/Mac
```

## Services Access

After starting the application, you can access:

- **API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:9090
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9091

## Configuration

The application uses environment variables for configuration. Key settings:

```bash
# Database (Neon PostgreSQL)
NEON_DATABASE_URL=postgresql://neondb_owner:Wjp.941768583@ep-noisy-mountain-a4dckdrs-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Server
NOVATRA_SERVER_PORT=8080
NOVATRA_SERVER_HOST=0.0.0.0

# Environment
NOVATRA_ENVIRONMENT=development
NOVATRA_DEBUG=true
```

## API Endpoints

### Repository Management
- `GET /api/v1/repositories` - List repositories
- `POST /api/v1/repositories` - Create repository
- `GET /api/v1/repositories/:id` - Get repository details
- `PUT /api/v1/repositories/:id` - Update repository
- `DELETE /api/v1/repositories/:id` - Delete repository

### Artifact Management
- `GET /api/v1/artifacts` - List artifacts
- `POST /api/v1/artifacts` - Upload artifact
- `GET /api/v1/artifacts/:id` - Get artifact
- `DELETE /api/v1/artifacts/:id` - Delete artifact

### Search
- `GET /api/v1/search/artifacts` - Search artifacts
- `POST /api/v1/search/vector` - Vector semantic search

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Core Services │
│   React 19      │───▶│   Rust/Axum     │───▶│   Go Microservices│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐             │
                       │   Storage       │◄────────────┘
                       │ PostgreSQL      │
                       │ + pgvector      │
                       │ Redis           │
                       │ MinIO           │
                       └─────────────────┘
```

## Technology Stack

### Backend
- **Language**: Go 1.23
- **Framework**: Gin + uber-go/fx
- **Database**: PostgreSQL 16 (Neon) + pgvector
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Message Queue**: NATS JetStream
- **Monitoring**: Prometheus + Grafana + Loki

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Security**: Semgrep scanning

## Development Commands

```bash
# Build the application
make build

# Run tests
make test

# Start development environment
make dev

# View logs
make logs

# Clean up
make clean

# Security scan
make security-scan

# Performance benchmarks
make benchmark
```

## Project Structure

```
novatra1/
├── cmd/api/           # Application entry point
├── internal/          # Private application code
│   ├── auth/         # Authentication logic
│   ├── config/       # Configuration management
│   └── storage/      # Data access layer
├── pkg/              # Public library code
│   ├── http/         # HTTP handlers and routing
│   └── middleware/   # HTTP middleware
├── build/            # Docker build files
├── deploy/           # Kubernetes and deployment configs
├── scripts/          # Utility scripts
├── docs/             # Documentation
└── tests/            # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

This project uses automated security scanning with Semgrep. All code changes are automatically scanned for security vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: support@novatra.io
- 💬 Discord: [Community Server](https://discord.gg/novatra)
- 📖 Documentation: [docs.novatra.io](https://docs.novatra.io)

---

Built with ❤️ by the Novatra team