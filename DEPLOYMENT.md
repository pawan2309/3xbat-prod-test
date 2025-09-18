# 3xBat Production Deployment Guide

This guide will help you deploy the 3xBat betting platform to production on AWS.

## 🚀 Prerequisites

- AWS EC2 instance (Ubuntu 20.04+ recommended)
- Domain name pointing to your server IP
- Docker and Docker Compose installed
- Basic knowledge of Linux commands

## 📋 Pre-Deployment Checklist

- [ ] Server IP: `13.60.145.70` (update in all config files)
- [ ] Domain name configured
- [ ] SSL certificates ready (Let's Encrypt)
- [ ] Database credentials set
- [ ] External API endpoints verified

## 🛠️ Step-by-Step Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply docker group changes
```

### 2. Clone Repository

```bash
git clone https://github.com/pawan2309/3xbat-prod-test.git
cd 3xbat-prod-test
```

### 3. Environment Configuration

```bash
# Backend environment
cp production.env.template backend/.env.production

# Frontend environments
cp frontend.env.template frontend/apps/user-panel/.env.local
cp frontend.env.template frontend/apps/client-panels/.env.local
cp frontend.env.template frontend/apps/control-panel/.env.local
```

### 4. Update Configuration Files

Edit the following files with your specific values:

#### Backend Environment (`backend/.env.production`)
```bash
# Update these values
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@postgres:5432/betting_db"
JWT_SECRET="YOUR_SECURE_JWT_SECRET"
REDIS_URL="redis://redis:6380"
```

#### Frontend Environment (all `.env.local` files)
```bash
# Update with your server IP
NEXT_PUBLIC_API_URL=http://13.60.145.70:4000
NEXT_PUBLIC_WS_URL=ws://13.60.145.70:4000
```

#### Nginx Configuration
Update domain names in `nginx/nginx-production.conf`:
```nginx
server_name yourdomain.com *.yourdomain.com;
```

### 5. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificates
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com

# Set up automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Database Setup

```bash
# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose exec backend npx prisma generate
```

## 🔧 Configuration Details

### Port Configuration
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS (main application)
- **4000**: Backend API
- **3000**: Client Panels
- **3001**: Control Panel
- **3002**: User Panel
- **5432**: PostgreSQL
- **6380**: Redis

### Service URLs
- Main Site: `https://yourdomain.com`
- API: `https://api.yourdomain.com`
- Control Panel: `https://control.yourdomain.com`
- Admin Panel: `https://adm.yourdomain.com`

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting:**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Database connection issues:**
   ```bash
   docker-compose exec postgres psql -U postgres -d betting_db
   ```

3. **SSL certificate issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **Port conflicts:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

### Health Checks

```bash
# Check all services
curl http://13.60.145.70:4000/health

# Check specific services
curl http://13.60.145.70:3000  # Client Panels
curl http://13.60.145.70:3001  # Control Panel
curl http://13.60.145.70:3002  # User Panel
```

## 📊 Monitoring

### Log Files
```bash
# Application logs
docker-compose logs -f backend
docker-compose logs -f nginx

# System logs
sudo journalctl -u docker
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Disk usage
df -h
du -sh /var/lib/docker/
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build
```

### Database Backups
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres betting_db > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres betting_db < backup.sql
```

### SSL Certificate Renewal
```bash
# Manual renewal
sudo certbot renew

# Check renewal status
sudo certbot certificates
```

## 🛡️ Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   docker-compose up -d
   ```

3. **Backup Strategy:**
   - Daily database backups
   - Weekly configuration backups
   - Monthly full system snapshots

## 📞 Support

If you encounter issues during deployment:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration files
3. Ensure all ports are available
4. Check domain DNS settings
5. Verify SSL certificate status

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test all user roles and permissions
2. ✅ Verify real-time features (WebSocket)
3. ✅ Test external API integrations
4. ✅ Check mobile responsiveness
5. ✅ Monitor performance and logs
6. ✅ Set up monitoring alerts

---

**Your 3xBat platform is now live and ready for production use! 🚀**
