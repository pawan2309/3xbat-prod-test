#!/bin/bash

# =============================================================================
# 3xbat SSH Reverse Tunnel Script
# =============================================================================
# This script creates SSH reverse tunnels for secure remote access to:
# - PostgreSQL Database (5432)
# - Redis (6380)
# - Backend API (4001)
# - Frontend (3000)
# - WebSocket (8080)
# =============================================================================

# Configuration
REMOTE_USER="your-remote-user"
REMOTE_HOST="your-remote-server.com"
REMOTE_PORT="22"
SSH_KEY_PATH="~/.ssh/id_rsa"

# Local ports (your development machine)
LOCAL_DB_PORT="5432"
LOCAL_REDIS_PORT="6380"
LOCAL_API_PORT="4001"
LOCAL_FRONTEND_PORT="3000"
LOCAL_WS_PORT="8080"

# Remote ports (on the remote server)
REMOTE_DB_PORT="15432"
REMOTE_REDIS_PORT="16380"
REMOTE_API_PORT="14001"
REMOTE_FRONTEND_PORT="13000"
REMOTE_WS_PORT="18080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if SSH key exists
check_ssh_key() {
    if [ ! -f "$SSH_KEY_PATH" ]; then
        print_error "SSH key not found at $SSH_KEY_PATH"
        print_status "Please generate an SSH key pair first:"
        echo "  ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
        echo "  ssh-copy-id $REMOTE_USER@$REMOTE_HOST"
        exit 1
    fi
}

# Function to create database tunnel
create_db_tunnel() {
    print_status "Creating PostgreSQL database tunnel..."
    print_status "Local: localhost:$LOCAL_DB_PORT -> Remote: localhost:$REMOTE_DB_PORT"
    
    ssh -f -N -R $REMOTE_DB_PORT:localhost:$LOCAL_DB_PORT \
        -i $SSH_KEY_PATH \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        print_success "Database tunnel created successfully"
        print_status "Connect to database using: localhost:$REMOTE_DB_PORT on remote server"
    else
        print_error "Failed to create database tunnel"
    fi
}

# Function to create Redis tunnel
create_redis_tunnel() {
    print_status "Creating Redis tunnel..."
    print_status "Local: localhost:$LOCAL_REDIS_PORT -> Remote: localhost:$REMOTE_REDIS_PORT"
    
    ssh -f -N -R $REMOTE_REDIS_PORT:localhost:$LOCAL_REDIS_PORT \
        -i $SSH_KEY_PATH \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        print_success "Redis tunnel created successfully"
        print_status "Connect to Redis using: localhost:$REMOTE_REDIS_PORT on remote server"
    else
        print_error "Failed to create Redis tunnel"
    fi
}

# Function to create API tunnel
create_api_tunnel() {
    print_status "Creating Backend API tunnel..."
    print_status "Local: localhost:$LOCAL_API_PORT -> Remote: localhost:$REMOTE_API_PORT"
    
    ssh -f -N -R $REMOTE_API_PORT:localhost:$LOCAL_API_PORT \
        -i $SSH_KEY_PATH \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        print_success "API tunnel created successfully"
        print_status "Access API at: http://localhost:$REMOTE_API_PORT on remote server"
    else
        print_error "Failed to create API tunnel"
    fi
}

# Function to create frontend tunnel
create_frontend_tunnel() {
    print_status "Creating Frontend tunnel..."
    print_status "Local: localhost:$LOCAL_FRONTEND_PORT -> Remote: localhost:$REMOTE_FRONTEND_PORT"
    
    ssh -f -N -R $REMOTE_FRONTEND_PORT:localhost:$LOCAL_FRONTEND_PORT \
        -i $SSH_KEY_PATH \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tunnel created successfully"
        print_status "Access frontend at: http://localhost:$REMOTE_FRONTEND_PORT on remote server"
    else
        print_error "Failed to create frontend tunnel"
    fi
}

# Function to create WebSocket tunnel
create_ws_tunnel() {
    print_status "Creating WebSocket tunnel..."
    print_status "Local: localhost:$LOCAL_WS_PORT -> Remote: localhost:$REMOTE_WS_PORT"
    
    ssh -f -N -R $REMOTE_WS_PORT:localhost:$LOCAL_WS_PORT \
        -i $SSH_KEY_PATH \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        $REMOTE_USER@$REMOTE_HOST
    
    if [ $? -eq 0 ]; then
        print_success "WebSocket tunnel created successfully"
        print_status "Connect to WebSocket at: ws://localhost:$REMOTE_WS_PORT on remote server"
    else
        print_error "Failed to create WebSocket tunnel"
    fi
}

# Function to create all tunnels
create_all_tunnels() {
    print_status "Creating all SSH reverse tunnels..."
    
    create_db_tunnel
    create_redis_tunnel
    create_api_tunnel
    create_frontend_tunnel
    create_ws_tunnel
    
    print_success "All tunnels created successfully!"
    print_status "Tunnel summary:"
    echo "  Database:   localhost:$REMOTE_DB_PORT -> localhost:$LOCAL_DB_PORT"
    echo "  Redis:      localhost:$REMOTE_REDIS_PORT -> localhost:$LOCAL_REDIS_PORT"
    echo "  API:        localhost:$REMOTE_API_PORT -> localhost:$LOCAL_API_PORT"
    echo "  Frontend:   localhost:$REMOTE_FRONTEND_PORT -> localhost:$LOCAL_FRONTEND_PORT"
    echo "  WebSocket:  localhost:$REMOTE_WS_PORT -> localhost:$LOCAL_WS_PORT"
}

# Function to list active tunnels
list_tunnels() {
    print_status "Checking active SSH connections..."
    ssh_connections=$(ps aux | grep "ssh.*-R" | grep -v grep)
    
    if [ -z "$ssh_connections" ]; then
        print_warning "No active SSH tunnels found"
    else
        print_success "Active SSH tunnels:"
        echo "$ssh_connections"
    fi
}

# Function to kill all tunnels
kill_tunnels() {
    print_status "Killing all SSH tunnels..."
    
    # Kill all SSH processes with reverse tunnels
    pids=$(ps aux | grep "ssh.*-R" | grep -v grep | awk '{print $2}')
    
    if [ -z "$pids" ]; then
        print_warning "No active SSH tunnels found"
    else
        for pid in $pids; do
            kill $pid 2>/dev/null
            if [ $? -eq 0 ]; then
                print_success "Killed tunnel process: $pid"
            else
                print_error "Failed to kill tunnel process: $pid"
            fi
        done
        print_success "All tunnels killed successfully"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all         Create all SSH reverse tunnels"
    echo "  db          Create database tunnel only"
    echo "  redis       Create Redis tunnel only"
    echo "  api         Create API tunnel only"
    echo "  frontend    Create frontend tunnel only"
    echo "  ws          Create WebSocket tunnel only"
    echo "  list        List active tunnels"
    echo "  kill        Kill all active tunnels"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all          # Create all tunnels"
    echo "  $0 db           # Create database tunnel only"
    echo "  $0 list         # List active tunnels"
    echo "  $0 kill         # Kill all tunnels"
}

# Main script logic
main() {
    case "${1:-help}" in
        "all")
            check_ssh_key
            create_all_tunnels
            ;;
        "db")
            check_ssh_key
            create_db_tunnel
            ;;
        "redis")
            check_ssh_key
            create_redis_tunnel
            ;;
        "api")
            check_ssh_key
            create_api_tunnel
            ;;
        "frontend")
            check_ssh_key
            create_frontend_tunnel
            ;;
        "ws")
            check_ssh_key
            create_ws_tunnel
            ;;
        "list")
            list_tunnels
            ;;
        "kill")
            kill_tunnels
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@" 