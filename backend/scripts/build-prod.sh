#!/bin/bash

# Production Build Script for 3xbat Backend
set -e

echo "🚀 Starting production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Type check
echo "🔍 Running type check..."
npm run type-check

# Lint check
echo "🔍 Running lint check..."
npm run lint

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build:ts:prod

# Verify build
echo "✅ Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Build failed - dist/index.js not found"
    exit 1
fi

# Check file sizes
echo "📊 Build statistics:"
echo "  - Main file: $(du -h dist/index.js | cut -f1)"
echo "  - Total size: $(du -sh dist | cut -f1)"
echo "  - Files count: $(find dist -name "*.js" | wc -l)"

echo "✅ Production build completed successfully!"
echo "🚀 Ready to deploy with: npm start"
