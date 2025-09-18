#!/bin/bash

# Let's Encrypt SSL Certificate Setup for 3xbat Production
# This script sets up automatic SSL certificate generation and renewal

set -e

echo "🔐 Setting up Let's Encrypt SSL certificates for 3xbat..."

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

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install certbot
    else
        print_error "Unsupported OS. Please install certbot manually."
        exit 1
    fi
fi

# Create necessary directories
print_status "Creating SSL directories..."
mkdir -p ssl
mkdir -p /etc/letsencrypt/live/3xbat.com

# Generate initial self-signed certificate for nginx to start
print_status "Generating temporary self-signed certificate..."
openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=3xbat/CN=3xbat.com"

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

print_status "✅ SSL setup completed!"
print_status "📁 Certificates will be stored in: ./ssl/"
print_status ""
print_warning "Next steps for production:"
print_warning "1. Update your domain DNS to point to this server"
print_warning "2. Run: sudo certbot --nginx -d 3xbat.com -d *.3xbat.com"
print_warning "3. Set up automatic renewal: sudo crontab -e"
print_warning "4. Add: 0 12 * * * /usr/bin/certbot renew --quiet"

