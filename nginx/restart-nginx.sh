#!/bin/bash

# Script to restart nginx with updated configuration
echo "🔄 Restarting nginx with updated static file configuration..."

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "📦 Running inside Docker container"
    nginx -t && nginx -s reload
    echo "✅ Nginx configuration reloaded successfully"
else
    echo "🐳 Restarting nginx Docker container..."
    docker-compose restart nginx
    echo "✅ Nginx container restarted successfully"
fi

echo "🎉 Static file serving should now work for all panels!"
echo "📝 The 3x.PNG logo should now load correctly on control.3xbat.com"
