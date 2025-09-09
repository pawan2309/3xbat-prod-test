# 3xbat Environment Configuration Guide

## Overview
This document outlines the standardized environment variables and port configurations for the 3xbat betting platform.

## Port Configuration

### Backend Services
- **Primary Backend**: Port `4000`
- **WebSocket**: Same port as HTTP (4000)

### Frontend Services
- **Client Panels**: Port `3000`
- **Control Panel**: Port `3001`
- **User Panel**: Port `3002`

### Database Services
- **PostgreSQL**: Port `5432`
- **Redis**: Port `6380`

### Proxy Services
- **Nginx HTTP**: Port `80`
- **Nginx HTTPS**: Port `443`
- **Nginx Status**: Port `8080`
- **API Proxy**: Port `8000`

## Environment Variables

### Required Variables
```bash
# Server Configuration
NODE_ENV=development|production|test
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:password@host:5432/betting_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=betting_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Optional Variables
```bash
# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# External APIs
PROXY_SERVER_URL=http://localhost:8000
CRICKET_API_URL=https://marketsarket.qnsports.live
CASINO_API_URL=https://casino-api.example.com

# Frontend URLs
CLIENT_PANELS_URL=http://localhost:3000
CONTROL_PANEL_URL=http://localhost:3001
USER_PANEL_URL=http://localhost:3002
```

## Configuration Files

### Development
- Use `docker-compose.yml` for local development
- Backend service runs on port 4000
- Frontend services run on ports 3000, 3001, 3002

### Production (Kubernetes)
- Use `k8s/` directory configurations
- Single backend service on port 4000
- Frontend services on ports 3000, 3001, 3002 (load balanced)

## Fixed Issues

### Port Conflicts Resolved
1. **Backend Port Standardization**: All backend services now use port 4000 as primary
2. **Redis Port Configuration**: Set to 6380 as requested
3. **Environment Variable Consistency**: Standardized `DATABASE_URL` instead of `PG_URL`
4. **Frontend Port Reorganization**: Client Panels (3000), Control Panel (3001), User Panel (3002)
5. **Operating Panel Removal**: Removed from all configurations
6. **Frontend API URLs**: Made configurable via environment variables

### Environment Variable Improvements
1. **Missing .env Files**: Created template configurations
2. **Hardcoded Values**: Replaced with environment variable references
3. **Inconsistent Naming**: Standardized variable names across all configurations

## Usage

### Development Setup
1. Copy environment template to `.env` files
2. Update values as needed
3. Run `docker-compose up` for local development

### Production Deployment
1. Update `k8s/configmaps.yaml` with production values
2. Update `k8s/secrets.yaml` with sensitive data
3. Deploy using Kubernetes manifests

## Health Checks

### Backend Health
- **Endpoint**: `/health`
- **Port**: 4000
- **Response**: `{"status":"OK"}`

### Frontend Health
- **Endpoint**: `/`
- **Port**: 3000 (each service)
- **Response**: HTML page

### Database Health
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379

## Load Balancing

### Nginx Configuration
- **Backend Load Balancing**: Round-robin across backend instances
- **Frontend Load Balancing**: Least connections algorithm
- **Health Checks**: Automatic failover for unhealthy instances

### Kubernetes Service Discovery
- **Backend Service**: `backend-service:4000`
- **Redis Service**: `redis-service:6380`
- **PostgreSQL Service**: `postgres-service:5432`
