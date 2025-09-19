# PowerShell script to restart nginx with updated configuration
Write-Host "🔄 Restarting nginx with updated static file configuration..." -ForegroundColor Yellow

# Check if running in Docker
if (Test-Path "/.dockerenv") {
    Write-Host "📦 Running inside Docker container" -ForegroundColor Blue
    nginx -t
    if ($LASTEXITCODE -eq 0) {
        nginx -s reload
        Write-Host "✅ Nginx configuration reloaded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Nginx configuration test failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "🐳 Restarting nginx Docker container..." -ForegroundColor Blue
    docker-compose restart nginx
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nginx container restarted successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to restart nginx container" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 Static file serving should now work for all panels!" -ForegroundColor Green
Write-Host "📝 The 3x.PNG logo should now load correctly on control.3xbat.com" -ForegroundColor Cyan
