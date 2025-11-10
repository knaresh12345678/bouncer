@echo off
echo ========================================
echo Stopping Bouncer Application
echo ========================================
echo.

echo Stopping Docker services...
docker-compose -f docker-compose.services.yml down

echo.
echo ========================================
echo All services stopped!
echo ========================================
echo.
echo Note: Frontend and Backend processes in separate windows
echo need to be stopped manually (Ctrl+C in each window)
echo ========================================
pause
