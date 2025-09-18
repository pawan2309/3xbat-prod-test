#!/bin/bash

# Quick Fix Script for AWS Deployment
# Run this on your AWS server to fix the deployment

echo "🔧 Quick fix for AWS deployment..."

# Update nginx.conf with your domain
DOMAIN=${1:-3xbat.com}
echo "Using domain: $DOMAIN"

# Update nginx configuration
sed -i "s/3xbat.com/$DOMAIN/g" nginx.conf

# Generate SSL certificates if they don't exist
if [[ ! -f "ssl/cert.pem" ]] || [[ ! -f "ssl/key.pem" ]]; then
    echo "Generating SSL certificates..."
    chmod +x generate-ssl.sh
    ./generate-ssl.sh
fi

# Create necessary directories
mkdir -p logs ssl

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "✅ Quick fix completed!"
echo "Now run: docker-compose up -d"
