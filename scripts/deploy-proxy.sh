#!/bin/bash

# 3xbat API Proxy Deployment Script for AWS
# This script sets up the API proxy on your AWS EC2 server

echo "🚀 Deploying 3xbat API Proxy to AWS..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "📦 Installing npm..."
    sudo apt-get install -y npm
else
    echo "✅ npm already installed: $(npm --version)"
fi

# Create proxy directory
PROXY_DIR="/home/ubuntu/3xbat-api-proxy"
echo "📁 Creating proxy directory: $PROXY_DIR"
mkdir -p $PROXY_DIR

# Copy proxy files
echo "📋 Copying proxy files..."
cp api-proxy.js $PROXY_DIR/
cp package.json $PROXY_DIR/

# Navigate to proxy directory
cd $PROXY_DIR

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create systemd service file
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/3xbat-api-proxy.service > /dev/null <<EOF
[Unit]
Description=3xbat API Proxy
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$PROXY_DIR
ExecStart=/usr/bin/node api-proxy.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=17300

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🔄 Reloading systemd and enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable 3xbat-api-proxy
sudo systemctl start 3xbat-api-proxy

# Check service status
echo "📊 Checking service status..."
sudo systemctl status 3xbat-api-proxy --no-pager

# Test the proxy
echo "🧪 Testing proxy health endpoint..."
sleep 5
curl -s http://localhost:17300/health | jq . || echo "Proxy not responding yet, may need a moment to start"

echo ""
echo "✅ 3xbat API Proxy deployment complete!"
echo "🌐 Proxy running on: http://localhost:17300"
echo "📡 Health check: http://localhost:17300/health"
echo ""
echo "📋 Available endpoints:"
echo ""
echo "🏏 Cricket APIs:"
echo "  GET /cricket/scorecard?marketId={id}"
echo "  GET /cricket/tv?eventId={id}"
echo "  GET /cricket/fixtures"
echo "  GET /cricket/odds?eventId={id}"
echo ""
echo "🎰 Casino APIs:"
echo "  GET /casino/data/{gameType}      - Game types: teen20, ab20, dt20, aaa, card32eu, lucky7eu"
echo "  GET /casino/results/{gameType}   - Game types: teen20, ab20, dt20, aaa, card32eu, lucky7eu"
echo "  GET /casino/detail-results/{roundId} - Round ID from game data"
echo "  GET /casino/tv?id={streamId}     - Stream IDs: 3030, 3043, 3035, 3056, 3034, 3032"
echo ""
echo "🔧 Service management:"
echo "  sudo systemctl start 3xbat-api-proxy"
echo "  sudo systemctl stop 3xbat-api-proxy"
echo "  sudo systemctl restart 3xbat-api-proxy"
echo "  sudo systemctl status 3xbat-api-proxy"
echo "  sudo journalctl -u 3xbat-api-proxy -f" 