#!/bin/bash

# Nginx Load Balancer Deployment Script for 3xbat
# This script deploys the Nginx load balancer with proper configuration

set -e

echo "🚀 Deploying 3xbat Nginx Load Balancer..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install it first."
    exit 1
fi

# Generate SSL certificates if they don't exist
if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
    print_status "Generating SSL certificates..."
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
else
    print_status "SSL certificates already exist, skipping generation..."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p ssl

# Set proper permissions
print_status "Setting proper permissions..."
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Build and start Nginx container
print_status "Building and starting Nginx container..."
cd ..
docker-compose build nginx
docker-compose up -d nginx

# Wait for Nginx to be ready
print_status "Waiting for Nginx to be ready..."
sleep 10

# Check Nginx status
print_status "Checking Nginx status..."
if curl -f http://localhost:8080/nginx_status > /dev/null 2>&1; then
    print_status "✅ Nginx is running successfully!"
    print_status "🌐 Load balancer accessible at:"
    echo "   - HTTP:  http://localhost:80"
    echo "   - HTTPS: https://localhost:443"
    echo "   - Status: http://localhost:8080/nginx_status"
else
    print_error "❌ Nginx failed to start properly"
    print_status "Checking Nginx logs..."
    docker-compose logs nginx
    exit 1
fi

# Test load balancing
print_status "Testing load balancing..."
echo "Testing backend health endpoints..."

# Test each backend instance
for i in {1..3}; do
    if curl -f "http://localhost:300$((i-1))/api/health" > /dev/null 2>&1; then
        print_status "✅ Backend instance $i is healthy"
    else
        print_warning "⚠️  Backend instance $i is not responding"
    fi
done

# Test Nginx load balancing
print_status "Testing Nginx load balancing..."
if curl -f "https://localhost/api/health" > /dev/null 2>&1; then
    print_status "✅ Nginx load balancer is working correctly!"
else
    print_error "❌ Nginx load balancer is not working"
    exit 1
fi

print_status "🎯 Nginx Load Balancer deployment completed successfully!"
print_status "📊 You can monitor the load balancer at: http://localhost:8080/nginx_status"
print_status "🔧 To view logs: docker-compose logs nginx"
print_status "🛑 To stop: docker-compose stop nginx"
print_status "🚀 To restart: docker-compose restart nginx" 