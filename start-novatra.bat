@echo off
echo 🚀 Starting Novatra...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Set environment variables
set NOVATRA_ENVIRONMENT=development
set NOVATRA_DEBUG=true
set NEON_DATABASE_URL=postgresql://neondb_owner:Wjp.941768583@ep-noisy-mountain-a4dckdrs-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
set NOVATRA_SERVER_PORT=8080
set NOVATRA_SERVER_HOST=0.0.0.0

REM Start services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Build and run application
echo 📦 Building application...
make build

echo 🌟 Starting Novatra API server...
make run

echo ✅ Novatra started successfully!
echo.
echo 📍 Services available at:
echo    • API:        http://localhost:8080
echo    • Health:     http://localhost:8080/health
echo    • MinIO:      http://localhost:9001
echo    • Grafana:    http://localhost:3000 (admin/admin)
echo.
pause