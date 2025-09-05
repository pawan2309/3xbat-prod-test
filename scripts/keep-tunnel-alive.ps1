# PowerShell script to keep SSH tunnel alive
# External APIs - Backend to AWS Proxy

param(
    [switch]$Verbose
)

$tunnelName = "External APIs - Backend to AWS Proxy"
$localPort = 8000
$remotePort = 17300
$awsServer = "ec2-13-60-145-70.eu-north-1.compute.amazonaws.com"
$keyPath = "C:\batx.pem"

function Write-Header {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "    SSH Tunnel - $tunnelName" -ForegroundColor White
    Write-Host "    Backend to AWS Proxy" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Local Port: $localPort" -ForegroundColor Green
    Write-Host "Remote Port: $remotePort" -ForegroundColor Green
    Write-Host "AWS Server: $awsServer" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting SSH tunnel..." -ForegroundColor Yellow
    Write-Host ""
}

function Start-Tunnel {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Starting SSH tunnel..." -ForegroundColor Green
    
    if ($Verbose) {
        Write-Host "Command: ssh -i `"$keyPath`" -L ${localPort}:localhost:${remotePort} ubuntu@${awsServer} -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3" -ForegroundColor Gray
    }
    
    try {
        ssh -i $keyPath -L "${localPort}:localhost:${remotePort}" "ubuntu@${awsServer}" -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3
    }
    catch {
        Write-Host "SSH command failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-ReconnectMessage {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host ""
    Write-Host "[$timestamp] Tunnel disconnected!" -ForegroundColor Red
    Write-Host "Reconnecting in 5 seconds..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
    Write-Host ""
}

# Main execution
Write-Header

while ($true) {
    Start-Tunnel
    Show-ReconnectMessage
    
    try {
        Start-Sleep -Seconds 5
    }
    catch {
        Write-Host "Interrupted by user" -ForegroundColor Yellow
        break
    }
} 