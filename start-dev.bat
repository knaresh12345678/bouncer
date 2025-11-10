@echo off
echo ========================================
echo Starting Bouncer Application
echo ========================================
echo.

REM Start Docker services (PostgreSQL and Redis)
echo [1/3] Starting Docker services (PostgreSQL and Redis)...
docker-compose -f docker-compose.services.yml up -d

REM Wait for services to be healthy
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting Backend...
echo Backend will start on http://localhost:8000
start cmd /k "cd backend && python simple_app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
echo Frontend will start on http://localhost:3000
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo PostgreSQL: localhost:5433
echo Redis: localhost:6380
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to view service status...
pause >nul

docker-compose -f docker-compose.services.yml ps
