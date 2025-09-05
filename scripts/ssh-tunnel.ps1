# =============================================================================
# 3xbat SSH Reverse Tunnel Script (PowerShell)
# =============================================================================
# This script creates SSH reverse tunnels for secure remote access to:
# - PostgreSQL Database (5432)
# - Redis (6380)
# - Backend API (4001)
# - Frontend (3000)
# - WebSocket (8080)
# =============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "db", "redis", "api", "frontend", "ws", "scorecard", "cricket-tv", "cricket-fixtures", "cricket-odds", "casino-tv", "casino-data", "list", "kill", "help")]
    [string]$Action = "help"
)

# Configuration
$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "ec2-13-60-145-70.eu-north-1.compute.amazonaws.com"
$REMOTE_PORT = "22"
$SSH_KEY_PATH = "C:\batx.pem"

# Local ports (your development machine)
$LOCAL_DB_PORT = "5432"
$LOCAL_REDIS_PORT = "6380"
$LOCAL_API_PORT = "4001"
$LOCAL_FRONTEND_PORT = "3000"
$LOCAL_WS_PORT = "8080"

# Remote ports (on the remote server)
$REMOTE_DB_PORT = "15432"
$REMOTE_REDIS_PORT = "16380"
$REMOTE_API_PORT = "14001"
$REMOTE_FRONTEND_PORT = "13000"
$REMOTE_WS_PORT = "18080"

# External API tunnel ports
$REMOTE_SCORECARD_PORT = "17300"
$REMOTE_CRICKET_TV_PORT = "17301"
$REMOTE_CRICKET_FIXTURES_PORT = "17302"
$REMOTE_CRICKET_ODDS_PORT = "17303"
$REMOTE_CASINO_TV_PORT = "17304"
$REMOTE_CASINO_DATA_PORT = "17305"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if SSH key exists
function Test-SSHKey {
    if (-not (Test-Path $SSH_KEY_PATH)) {
        Write-Error "SSH key not found at $SSH_KEY_PATH"
        Write-Status "Please generate an SSH key pair first:"
        Write-Host "  ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'" -ForegroundColor Cyan
        Write-Host "  ssh-copy-id $REMOTE_USER@$REMOTE_HOST" -ForegroundColor Cyan
        exit 1
    }
}

# Function to create database tunnel
function New-DatabaseTunnel {
    Write-Status "Creating PostgreSQL database tunnel..."
    Write-Status "Local: localhost:$LOCAL_DB_PORT -> Remote: localhost:$REMOTE_DB_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_DB_PORT`:localhost:$LOCAL_DB_PORT",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database tunnel created successfully"
        Write-Status "Connect to database using: localhost:$REMOTE_DB_PORT on remote server"
    } else {
        Write-Error "Failed to create database tunnel"
    }
}

# Function to create Redis tunnel
function New-RedisTunnel {
    Write-Status "Creating Redis tunnel..."
    Write-Status "Local: localhost:$LOCAL_REDIS_PORT -> Remote: localhost:$REMOTE_REDIS_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_REDIS_PORT`:localhost:$LOCAL_REDIS_PORT",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Redis tunnel created successfully"
        Write-Status "Connect to Redis using: localhost:$REMOTE_REDIS_PORT on remote server"
    } else {
        Write-Error "Failed to create Redis tunnel"
    }
}

# Function to create API tunnel
function New-APITunnel {
    Write-Status "Creating Backend API tunnel..."
    Write-Status "Local: localhost:$LOCAL_API_PORT -> Remote: localhost:$REMOTE_API_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_API_PORT`:localhost:$LOCAL_API_PORT",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "API tunnel created successfully"
        Write-Status "Access API at: http://localhost:$REMOTE_API_PORT on remote server"
    } else {
        Write-Error "Failed to create API tunnel"
    }
}

# Function to create frontend tunnel
function New-FrontendTunnel {
    Write-Status "Creating Frontend tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_FRONTEND_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_FRONTEND_PORT`:localhost:$LOCAL_FRONTEND_PORT",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend tunnel created successfully"
        Write-Status "Access frontend at: http://localhost:$REMOTE_FRONTEND_PORT on remote server"
    } else {
        Write-Error "Failed to create frontend tunnel"
    }
}

# Function to create WebSocket tunnel
function New-WebSocketTunnel {
    Write-Status "Creating WebSocket tunnel..."
    Write-Status "Local: localhost:$LOCAL_WS_PORT -> Remote: localhost:$REMOTE_WS_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_WS_PORT`:localhost:$LOCAL_WS_PORT",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "WebSocket tunnel created successfully"
        Write-Status "Connect to WebSocket at: ws://localhost:$REMOTE_WS_PORT on remote server"
    } else {
        Write-Error "Failed to create WebSocket tunnel"
    }
}

# Function to create Scorecard API tunnel
function New-ScorecardTunnel {
    Write-Status "Creating Cricket Scorecard API tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_SCORECARD_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_SCORECARD_PORT`:172.104.206.227:3000",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Scorecard API tunnel created successfully"
        Write-Status "Access scorecard API at: localhost:$REMOTE_SCORECARD_PORT on remote server"
    } else {
        Write-Error "Failed to create scorecard API tunnel"
    }
}

# Function to create Cricket TV tunnel
function New-CricketTVTunnel {
    Write-Status "Creating Cricket TV Streaming tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_CRICKET_TV_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_CRICKET_TV_PORT`:mis3.sqmr.xyz:80",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cricket TV tunnel created successfully"
        Write-Status "Access cricket TV at: localhost:$REMOTE_CRICKET_TV_PORT on remote server"
    } else {
        Write-Error "Failed to create cricket TV tunnel"
    }
}

# Function to create Cricket Fixtures tunnel
function New-CricketFixturesTunnel {
    Write-Status "Creating Cricket Fixtures API tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_CRICKET_FIXTURES_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_CRICKET_FIXTURES_PORT`:marketsarket.qnsports.live:443",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cricket Fixtures tunnel created successfully"
        Write-Status "Access fixtures API at: localhost:$REMOTE_CRICKET_FIXTURES_PORT on remote server"
    } else {
        Write-Error "Failed to create cricket fixtures tunnel"
    }
}

# Function to create Cricket Odds tunnel
function New-CricketOddsTunnel {
    Write-Status "Creating Cricket Odds API tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_CRICKET_ODDS_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_CRICKET_ODDS_PORT`:data.shamexch.xyz:443",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Cricket Odds tunnel created successfully"
        Write-Status "Access odds API at: localhost:$REMOTE_CRICKET_ODDS_PORT on remote server"
    } else {
        Write-Error "Failed to create cricket odds tunnel"
    }
}

# Function to create Casino TV tunnel
function New-CasinoTVTunnel {
    Write-Status "Creating Casino TV Streaming tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_CASINO_TV_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_CASINO_TV_PORT`:jmdapi.com:443",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Casino TV tunnel created successfully"
        Write-Status "Access casino TV at: localhost:$REMOTE_CASINO_TV_PORT on remote server"
    } else {
        Write-Error "Failed to create casino TV tunnel"
    }
}

# Function to create Casino Data tunnel
function New-CasinoDataTunnel {
    Write-Status "Creating Casino Data API tunnel..."
    Write-Status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_CASINO_DATA_PORT"
    
    $sshArgs = @(
        "-f", "-N",
        "-R", "$REMOTE_CASINO_DATA_PORT`:159.65.20.25:3000",
        "-i", $SSH_KEY_PATH,
        "-o", "ServerAliveInterval=60",
        "-o", "ServerAliveCountMax=3",
        "$REMOTE_USER@$REMOTE_HOST"
    )
    
    Start-Process -FilePath "ssh" -ArgumentList $sshArgs -WindowStyle Hidden
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Casino Data tunnel created successfully"
        Write-Status "Access casino data API at: localhost:$REMOTE_CASINO_DATA_PORT on remote server"
    } else {
        Write-Error "Failed to create casino data tunnel"
    }
}

# Function to create all tunnels
function New-AllTunnels {
    Write-Status "Creating all SSH reverse tunnels..."
    
    New-DatabaseTunnel
    New-RedisTunnel
    New-APITunnel
    New-FrontendTunnel
    New-WebSocketTunnel
    New-ScorecardTunnel
    New-CricketTVTunnel
    New-CricketFixturesTunnel
    New-CricketOddsTunnel
    New-CasinoTVTunnel
    New-CasinoDataTunnel
    
    Write-Success "All tunnels created successfully!"
    Write-Status "Tunnel summary:"
    Write-Host "  Database:   localhost:$REMOTE_DB_PORT -> localhost:$LOCAL_DB_PORT" -ForegroundColor Cyan
    Write-Host "  Redis:      localhost:$REMOTE_REDIS_PORT -> localhost:$LOCAL_REDIS_PORT" -ForegroundColor Cyan
    Write-Host "  API:        localhost:$REMOTE_API_PORT -> localhost:$LOCAL_API_PORT" -ForegroundColor Cyan
    Write-Host "  Frontend:   localhost:$REMOTE_FRONTEND_PORT -> localhost:$LOCAL_FRONTEND_PORT" -ForegroundColor Cyan
    Write-Host "  WebSocket:  localhost:$REMOTE_WS_PORT -> localhost:$LOCAL_WS_PORT" -ForegroundColor Cyan
    Write-Host "  Scorecard:  localhost:$REMOTE_SCORECARD_PORT -> 172.104.206.227:3000" -ForegroundColor Cyan
    Write-Host "  Cricket TV: localhost:$REMOTE_CRICKET_TV_PORT -> mis3.sqmr.xyz:80" -ForegroundColor Cyan
    Write-Host "  Fixtures:   localhost:$REMOTE_CRICKET_FIXTURES_PORT -> marketsarket.qnsports.live:443" -ForegroundColor Cyan
    Write-Host "  Odds:       localhost:$REMOTE_CRICKET_ODDS_PORT -> data.shamexch.xyz:443" -ForegroundColor Cyan
    Write-Host "  Casino TV:  localhost:$REMOTE_CASINO_TV_PORT -> jmdapi.com:443" -ForegroundColor Cyan
    Write-Host "  Casino Data:localhost:$REMOTE_CASINO_DATA_PORT -> 159.65.20.25:3000" -ForegroundColor Cyan
}

# Function to list active tunnels
function Get-Tunnels {
    Write-Status "Checking active SSH connections..."
    
    $sshProcesses = Get-Process | Where-Object { $_.ProcessName -eq "ssh" }
    
    if ($sshProcesses) {
        Write-Success "Active SSH processes found:"
        $sshProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    } else {
        Write-Warning "No active SSH processes found"
    }
}

# Function to kill all tunnels
function Stop-Tunnels {
    Write-Status "Killing all SSH processes..."
    
    $sshProcesses = Get-Process | Where-Object { $_.ProcessName -eq "ssh" }
    
    if ($sshProcesses) {
        foreach ($process in $sshProcesses) {
            try {
                Stop-Process -Id $process.Id -Force
                Write-Success "Killed SSH process: $($process.Id)"
            } catch {
                Write-Error "Failed to kill SSH process: $($process.Id)"
            }
        }
        Write-Success "All SSH processes killed successfully"
    } else {
        Write-Warning "No active SSH processes found"
    }
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\ssh-tunnel.ps1 [OPTION]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  all             Create all SSH reverse tunnels" -ForegroundColor White
    Write-Host "  db              Create database tunnel only" -ForegroundColor White
    Write-Host "  redis           Create Redis tunnel only" -ForegroundColor White
    Write-Host "  api             Create API tunnel only" -ForegroundColor White
    Write-Host "  frontend        Create frontend tunnel only" -ForegroundColor White
    Write-Host "  ws              Create WebSocket tunnel only" -ForegroundColor White
    Write-Host "  scorecard       Create cricket scorecard API tunnel" -ForegroundColor White
    Write-Host "  cricket-tv      Create cricket TV streaming tunnel" -ForegroundColor White
    Write-Host "  cricket-fixtures Create cricket fixtures API tunnel" -ForegroundColor White
    Write-Host "  cricket-odds    Create cricket odds API tunnel" -ForegroundColor White
    Write-Host "  casino-tv       Create casino TV streaming tunnel" -ForegroundColor White
    Write-Host "  casino-data     Create casino data API tunnel" -ForegroundColor White
    Write-Host "  list            List active tunnels" -ForegroundColor White
    Write-Host "  kill            Kill all active tunnels" -ForegroundColor White
    Write-Host "  help            Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\ssh-tunnel.ps1 all              # Create all tunnels" -ForegroundColor Cyan
    Write-Host "  .\ssh-tunnel.ps1 db               # Create database tunnel only" -ForegroundColor Cyan
    Write-Host "  .\ssh-tunnel.ps1 scorecard        # Create scorecard API tunnel" -ForegroundColor Cyan
    Write-Host "  .\ssh-tunnel.ps1 cricket-tv       # Create cricket TV tunnel" -ForegroundColor Cyan
    Write-Host "  .\ssh-tunnel.ps1 list             # List active tunnels" -ForegroundColor Cyan
    Write-Host "  .\ssh-tunnel.ps1 kill             # Kill all tunnels" -ForegroundColor Cyan
}

# Main script logic
switch ($Action) {
    "all" {
        Test-SSHKey
        New-AllTunnels
    }
    "db" {
        Test-SSHKey
        New-DatabaseTunnel
    }
    "redis" {
        Test-SSHKey
        New-RedisTunnel
    }
    "api" {
        Test-SSHKey
        New-APITunnel
    }
    "frontend" {
        Test-SSHKey
        New-FrontendTunnel
    }
    "ws" {
        Test-SSHKey
        New-WebSocketTunnel
    }
    "scorecard" {
        Test-SSHKey
        New-ScorecardTunnel
    }
    "cricket-tv" {
        Test-SSHKey
        New-CricketTVTunnel
    }
    "cricket-fixtures" {
        Test-SSHKey
        New-CricketFixturesTunnel
    }
    "cricket-odds" {
        Test-SSHKey
        New-CricketOddsTunnel
    }
    "casino-tv" {
        Test-SSHKey
        New-CasinoTVTunnel
    }
    "casino-data" {
        Test-SSHKey
        New-CasinoDataTunnel
    }
    "list" {
        Get-Tunnels
    }
    "kill" {
        Stop-Tunnels
    }
    "help" {
        Show-Usage
    }
    default {
        Show-Usage
    }
} 