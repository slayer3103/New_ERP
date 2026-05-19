@echo off
echo ========================================
echo    ERP Software - Quick Start
echo ========================================
echo.
echo Starting ERP Software...
echo This may take 5-10 minutes on first run
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running... Starting containers...
echo.

REM Start the containers
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start containers!
    echo Please check Docker Desktop and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    SUCCESS! ERP Software is starting...
echo ========================================
echo.
echo Please wait 2-3 minutes for everything to load
echo.
echo Then open your browser and go to:
echo    http://localhost
echo.
echo To stop the application, run:
echo    docker-compose down
echo.
echo Press any key to open browser...
pause >nul

REM Try to open browser
start http://localhost

echo.
echo ERP Software is now running!
echo Press any key to exit...
pause >nul