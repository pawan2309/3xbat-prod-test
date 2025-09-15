@echo off
REM Docker Backend Management Script

echo 🐳 3xbat Backend Docker Management
echo.

if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="shell" goto shell
goto help

:build
echo 🔨 Building backend container...
docker-compose build backend
echo ✅ Backend build completed!
goto end

:start
echo 🚀 Starting backend container...
docker-compose up -d backend
echo ✅ Backend started!
echo 📊 Backend running at: http://localhost:4000
echo 🔍 Health check: http://localhost:4000/health
goto end

:stop
echo 🛑 Stopping backend container...
docker-compose stop backend
echo ✅ Backend stopped!
goto end

:restart
echo 🔄 Restarting backend container...
docker-compose restart backend
echo ✅ Backend restarted!
goto end

:logs
echo 📋 Showing backend logs...
docker-compose logs -f backend
goto end

:shell
echo 🐚 Opening backend container shell...
docker-compose exec backend sh
goto end

:help
echo Usage: docker-backend.bat [command]
echo.
echo Commands:
echo   build    - Build the backend container
echo   start    - Start the backend container
echo   stop     - Stop the backend container
echo   restart  - Restart the backend container
echo   logs     - Show backend logs
echo   shell    - Open shell in backend container
echo.
echo Examples:
echo   docker-backend.bat build
echo   docker-backend.bat start
echo   docker-backend.bat logs
goto end

:end
