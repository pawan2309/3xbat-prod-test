@echo off
REM Production Build Script for 3xbat Backend

echo 🚀 Starting production build...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the backend directory.
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

REM Type check
echo 🔍 Running type check...
call npm run type-check

REM Lint check
echo 🔍 Running lint check...
call npm run lint

REM Build TypeScript
echo 🔨 Building TypeScript...
call npm run build:ts:prod

REM Verify build
echo ✅ Verifying build...
if not exist "dist\index.js" (
    echo ❌ Error: Build failed - dist\index.js not found
    exit /b 1
)

REM Check file sizes
echo 📊 Build statistics:
for %%A in (dist\index.js) do echo   - Main file: %%~zA bytes
for /f %%A in ('dir /s /-c dist ^| find "File(s)"') do echo   - Total files: %%A

echo ✅ Production build completed successfully!
echo 🚀 Ready to deploy with: npm start
