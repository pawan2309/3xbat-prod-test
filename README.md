# 3xBat - Production Betting Platform

A comprehensive betting platform with real-time cricket and casino games, built with Node.js, Next.js, and PostgreSQL.

## 🚀 Production Features

- **Multi-Role System**: Owner, Sub-Owner, Super Admin, Admin, Sub-Admin, Master Agent, Super Agent, Agent, and User roles
- **Real-time Betting**: Live cricket odds and casino games with WebSocket support
- **Commission Management**: Hierarchical commission sharing system
- **User Management**: Complete user lifecycle management with role-based access
- **Live Streaming**: Integrated cricket TV streaming and casino game streams
- **Responsive Design**: Mobile-first design for all devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nginx (443)   │────│  Backend (4000)  │────│  PostgreSQL     │
│   Load Balancer │    │  API Server      │    │  Database       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌──────────────────┐
         └──────────────│  Redis Cache     │
                        └──────────────────┘
```

## 🌐 Subdomain Structure

- `api.yourdomain.com` - Backend API
- `yourdomain.com` - Client panels (User role)
- `control.yourdomain.com` - Control panel (Owner role)
- `adm.yourdomain.com` - Admin panel (Admin role)
- `suo.yourdomain.com` - Sub-owner panel (Sub-Owner role)
- `sup.yourdomain.com` - Super admin panel (Super Admin role)
- `mas.yourdomain.com` - Master agent panel (Master Agent role)
- `sua.yourdomain.com` - Super agent panel (Super Agent role)
- `age.yourdomain.com` - Agent panel (Agent role)
- `sub.yourdomain.com` - Sub-admin panel (Sub-Admin role)

## 🛠️ Technology Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **PostgreSQL** with Prisma ORM
- **Redis** for caching and sessions
- **Socket.io** for real-time communication
- **JWT** for authentication

### Frontend
- **Next.js 14** with TypeScript
- **React 18** with hooks
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates

### Infrastructure
- **Docker** and **Docker Compose**
- **Nginx** for load balancing and SSL termination
- **Let's Encrypt** for SSL certificates

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 15+
- Redis 7+

### Production Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pawan2309/3xbat-prod-test.git
   cd 3xbat-prod-test
   ```

2. **Set up environment variables:**
   ```bash
   # Backend environment
   cp production.env.template backend/.env.production
   
   # Frontend environments
   cp frontend.env.template frontend/apps/user-panel/.env.local
   cp frontend.env.template frontend/apps/client-panels/.env.local
   cp frontend.env.template frontend/apps/control-panel/.env.local
   ```

3. **Update configuration:**
   - Edit `backend/.env.production` with your database credentials
   - Update domain names in nginx configuration
   - Set your server IP address in environment files

4. **Deploy with Docker:**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # Or use the AWS deployment script
   chmod +x nginx/aws-deploy.sh
   ./nginx/aws-deploy.sh yourdomain.com
   ```

## 📁 Project Structure

```
3xbat-prod-test/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── api/            # API routes and handlers
│   │   ├── config/         # Configuration files
│   │   ├── external-apis/  # External API integrations
│   │   ├── infrastructure/ # Redis, WebSocket, etc.
│   │   ├── lib/           # Shared utilities
│   │   ├── middleware/    # Express middleware
│   │   ├── monitoring/    # Logging and metrics
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── Dockerfile         # Production Docker image
├── frontend/              # Frontend applications
│   ├── apps/
│   │   ├── client-panels/ # Main betting interface
│   │   ├── control-panel/ # Admin control panel
│   │   └── user-panel/    # User management panel
│   └── packages/          # Shared packages
├── nginx/                 # Nginx configuration
│   ├── nginx.conf         # Development config
│   ├── nginx-production.conf # Production config
│   └── aws-deploy.sh      # AWS deployment script
├── docker-compose.yml     # Docker services configuration
└── production.env.template # Production environment template
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env.production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://redis:6380
CRICKET_API_URL=https://marketsarket.qnsports.live
CASINO_API_URL=https://casino-api.example.com
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://your-server-ip:4000
NEXT_PUBLIC_WS_URL=ws://your-server-ip:4000
NEXT_PUBLIC_CRICKET_SCORE=https://marketsarket.qnsports.live/cricket/scorecard?marketId=
NEXT_PUBLIC_CRICKET_TV=https://marketsarket.qnsports.live/cricket/tv?eventId=
```

## 🔐 Security Features

- **JWT Authentication** with secure token management
- **Role-based Access Control** with hierarchical permissions
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Validation** with Joi schemas
- **SQL Injection Protection** with Prisma ORM
- **XSS Protection** with Helmet.js

## 📊 Monitoring

- **Health Checks** for all services
- **Structured Logging** with Winston
- **Performance Metrics** collection
- **Error Tracking** and reporting
- **Real-time Monitoring** dashboard

## 🚀 Deployment

### AWS Deployment

1. **Launch EC2 Instance** (Ubuntu 20.04+)
2. **Install Docker & Docker Compose**
3. **Clone and configure** the application
4. **Run deployment script:**
   ```bash
   ./nginx/aws-deploy.sh yourdomain.com
   ```
5. **Configure DNS** to point to your server
6. **Set up SSL certificates** with Let's Encrypt

### Manual Deployment

1. **Build the application:**
   ```bash
   # Backend
   cd backend
   npm install
   npm run build:prod
   
   # Frontend
   cd frontend
   npm install
   npm run build
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Cricket Endpoints
- `GET /api/cricket/fixtures` - Get cricket matches
- `GET /api/cricket/odds?eventId={id}` - Get match odds
- `GET /api/cricket/scorecard?marketId={id}` - Get scorecard
- `GET /api/cricket/tv?eventId={id}` - Get TV stream

### Casino Endpoints
- `GET /api/casino/games/active` - Get active casino games
- `GET /api/casino/tv?streamid={id}` - Get casino stream
- `GET /api/casino/data/{gameType}` - Get game data

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Changelog

### v1.0.0 (Production Release)
- ✅ Multi-role user management system
- ✅ Real-time cricket betting with live odds
- ✅ Casino games integration
- ✅ Commission management system
- ✅ WebSocket real-time updates
- ✅ Mobile-responsive design
- ✅ Production-ready Docker deployment
- ✅ SSL/HTTPS support
- ✅ Load balancing with Nginx
- ✅ Direct external API integration (no SSH tunnels)

---

**Built with ❤️ for the betting community**
