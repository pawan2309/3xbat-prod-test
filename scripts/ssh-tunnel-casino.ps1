# Casino API SSH Tunnel Script
# Connects to 159.65.20.25:3000 for high-frequency casino data updates

param(
    [string]$Action = "start"
)

$ConfigPath = ".\casino-monitor.config.json"
$LogFile = ".\logs\casino-tunnel.log"

# Create logs directory if it doesn't exist
if (!(Test-Path ".\logs")) {
    New-Item -ItemType Directory -Path ".\logs" -Force
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Start-CasinoTunnel {
    Write-Log "Starting Casino API SSH Tunnel..."
    
    try {
        # Load configuration
        if (!(Test-Path $ConfigPath)) {
            throw "Configuration file not found: $ConfigPath"
        }
        
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $tunnel = $config.tunnel
        
        # SSH tunnel parameters
        $sshHost = "159.65.20.25"
        $sshUser = "ubuntu"
        $sshKey = "C:\batx.pem"
        $localPort = $tunnel.localPort
        $remotePort = $tunnel.remotePort
        
        Write-Log "Connecting to $sshHost:$remotePort -> localhost:$localPort"
        
        # Start SSH tunnel
        $sshCommand = "ssh -i `"$sshKey`" -L $localPort`:$sshHost`:$remotePort $sshUser@$sshHost -N -f"
        
        Write-Log "Executing: $sshCommand"
        
        # Execute SSH command
        Start-Process -FilePath "ssh" -ArgumentList @(
            "-i", "`"$sshKey`",
            "-L", "$localPort`:$sshHost`:$remotePort",
            "$sshUser@$sshHost",
            "-N", "-f"
        ) -NoNewWindow -PassThru
        
        Write-Log "Casino API SSH tunnel started successfully"
        Write-Log "Local port: $localPort"
        Write-Log "Remote endpoint: $sshHost`:$remotePort"
        Write-Log "Endpoints available:"
        Write-Log "  - GET http://localhost:$localPort/getdata/"
        Write-Log "  - GET http://localhost:$localPort/getresult/"
        
        # Test connection
        Start-Sleep -Seconds 3
        Test-CasinoConnection
        
    } catch {
        Write-Log "Error starting casino tunnel: $($_.Exception.Message)"
        throw
    }
}

function Stop-CasinoTunnel {
    Write-Log "Stopping Casino API SSH Tunnel..."
    
    try {
        # Find and kill SSH processes for casino tunnel
        $sshProcesses = Get-Process -Name "ssh" -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessName -eq "ssh" -and $_.CommandLine -like "*159.65.20.25*"
        }
        
        if ($sshProcesses) {
            foreach ($process in $sshProcesses) {
                Write-Log "Killing SSH process: $($process.Id)"
                Stop-Process -Id $process.Id -Force
            }
            Write-Log "Casino API SSH tunnel stopped"
        } else {
            Write-Log "No casino tunnel processes found"
        }
        
    } catch {
        Write-Log "Error stopping casino tunnel: $($_.Exception.Message)"
    }
}

function Test-CasinoConnection {
    Write-Log "Testing Casino API connection..."
    
    try {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $tunnel = $config.tunnel
        $localPort = $tunnel.localPort
        
        $testUrl = "http://localhost:$localPort/getdata/"
        Write-Log "Testing endpoint: $testUrl"
        
        $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Log "✅ Casino API connection successful"
            Write-Log "Response status: $($response.StatusCode)"
            Write-Log "Response time: $($response.BaseResponse.ResponseTime)ms"
        } else {
            Write-Log "⚠️ Casino API connection returned status: $($response.StatusCode)"
        }
        
    } catch {
        Write-Log "❌ Casino API connection failed: $($_.Exception.Message)"
    }
}

function Show-CasinoTunnelStatus {
    Write-Log "Casino API Tunnel Status:"
    
    try {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $tunnel = $config.tunnel
        
        Write-Log "Configuration:"
        Write-Log "  Local Port: $($tunnel.localPort)"
        Write-Log "  Remote Port: $($tunnel.remotePort)"
        Write-Log "  Health Check: $($tunnel.healthCheckEndpoint)"
        
        # Check if tunnel is active
        $sshProcesses = Get-Process -Name "ssh" -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessName -eq "ssh" -and $_.CommandLine -like "*159.65.20.25*"
        }
        
        if ($sshProcesses) {
            Write-Log "✅ Tunnel Status: ACTIVE"
            foreach ($process in $sshProcesses) {
                Write-Log "  Process ID: $($process.Id)"
                Write-Log "  Start Time: $($process.StartTime)"
            }
        } else {
            Write-Log "❌ Tunnel Status: INACTIVE"
        }
        
        # Test connection
        Test-CasinoConnection
        
    } catch {
        Write-Log "Error checking tunnel status: $($_.Exception.Message)"
    }
}

# Main execution
switch ($Action.ToLower()) {
    "start" {
        Start-CasinoTunnel
    }
    "stop" {
        Stop-CasinoTunnel
    }
    "status" {
        Show-CasinoTunnelStatus
    }
    "test" {
        Test-CasinoConnection
    }
    "restart" {
        Stop-CasinoTunnel
        Start-Sleep -Seconds 2
        Start-CasinoTunnel
    }
    default {
        Write-Log "Usage: .\ssh-tunnel-casino.ps1 [start|stop|status|test|restart]"
        Write-Log "Default action: start"
        Start-CasinoTunnel
    }
}
