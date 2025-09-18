#!/bin/bash

# AWS Deployment Script for 3xbat with SSL Certificate Setup
# This script handles deployment to AWS with proper SSL certificate configuration

set -e

echo "🚀 Deploying 3xbat to AWS with SSL certificates..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if domain is provided
if [ -z "$1" ]; then
    print_error "Please provide your domain name as an argument"
    print_error "Usage: ./aws-deploy.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
print_status "Deploying for domain: $DOMAIN"

# Update nginx configuration with the provided domain
print_status "Updating nginx configuration for domain: $DOMAIN"
sed -i "s/3xbat.com/$DOMAIN/g" nginx-production.conf

# Generate SSL certificates if they don't exist
if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
    print_status "Generating temporary SSL certificates..."
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
else
    print_status "SSL certificates already exist, skipping generation..."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p /var/www/certbot

# Set proper permissions
print_status "Setting proper permissions..."
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Build and start all services
print_status "Building and starting all services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Services are running successfully!"
else
    print_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Check Nginx status
print_status "Checking Nginx status..."
if curl -f http://13.60.145.70:8080/nginx_status > /dev/null 2>&1; then
    print_status "✅ Nginx is running and healthy!"
else
    print_warning "⚠️  Nginx health check failed, but service may still be starting..."
fi

print_status "🎉 Deployment completed successfully!"
print_status ""
print_warning "Next steps for SSL certificate setup:"
print_warning "1. Ensure your domain $DOMAIN points to this server's IP address"
print_warning "2. Run: sudo certbot --nginx -d $DOMAIN -d *.$DOMAIN"
print_warning "3. Set up automatic renewal: sudo crontab -e"
print_warning "4. Add: 0 12 * * * /usr/bin/certbot renew --quiet"
print_status ""
print_status "Your application is now accessible at:"
print_status "  - Main site: http://$DOMAIN (will redirect to HTTPS)"
print_status "  - API: https://api.$DOMAIN"
print_status "  - Control Panel: https://control.$DOMAIN"
print_status "  - Admin Panel: https://adm.$DOMAIN"
print_status "  - And other role-based subdomains..."

