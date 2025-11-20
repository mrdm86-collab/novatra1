@echo off
echo 🌟 Starting Novatra Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Set environment variables
set VITE_API_URL=http://localhost:8080
set VITE_ENABLE_SENTRY=false
set NODE_ENV=development

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server
echo 🚀 Starting development server on http://localhost:5173
echo.
echo 📍 Frontend will be available at:
echo    • Main App:    http://localhost:5173
echo    • API Proxy:  http://localhost:5173/api (proxied to backend)
echo.
echo 🔧 Environment:
echo    • VITE_API_URL: %VITE_API_URL%
echo    • VITE_ENABLE_SENTRY: %VITE_ENABLE_SENTRY%
echo    • NODE_ENV: %NODE_ENV%
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Start Vite development server
npm run dev

echo ✅ Frontend server stopped.
pause