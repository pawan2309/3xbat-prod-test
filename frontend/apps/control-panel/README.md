# 3xBat Control Panel

This is the refactored control panel (formerly operating panel) for the 3xBat betting platform. It provides administrative controls and management tools for the betting system.

## 🚀 **Features**

### **Core Functionality**
- **Cricket Dashboard** - Live match monitoring and management
- **Undeclare Match BetList** - Manage undeclared bets
- **Website Settings** - Platform configuration
- **Diamond Casino** - Casino game management
- **Matka Settings** - Matka game configuration
- **User Exposer** - User risk management
- **Settings** - System configuration

### **Technical Features**
- **Modern React 18** with Next.js 14 App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching
- **Responsive Design** for mobile and desktop
- **Real-time Updates** via WebSocket

## 🏗️ **Architecture**

### **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── layouts/          # Layout components
│   ├── providers/        # Context providers
│   └── ui/              # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # API services
├── stores/               # Zustand stores
├── styles/               # Global styles
├── types/                # TypeScript types
└── utils/                # Utility functions
```

### **Key Components**
- **MainLayout** - Main sidebar and navigation
- **Providers** - React Query, Auth, Theme, Socket
- **AuthStore** - Authentication state management
- **ApiClient** - HTTP client for backend communication

## 🛠️ **Setup & Installation**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Backend API running

### **Installation**
```bash
# Navigate to the control panel directory
cd 3xbat/frontend/apps/control-panel

# Install dependencies (if not using workspace)
npm install

# Start development server
npm run dev
```

### **Environment Variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 📱 **Responsive Design**

The control panel is fully responsive with:
- **Desktop**: Full sidebar with collapsible navigation
- **Mobile**: Hamburger menu with overlay sidebar
- **Tablet**: Adaptive layout for medium screens

## 🔐 **Authentication**

- **Login/Logout** functionality
- **JWT Token** management
- **Role-based** access control
- **Session** persistence

## 🎨 **UI/UX Features**

- **Dark Blue Theme** matching the original design
- **Smooth Animations** and transitions
- **Interactive Elements** with hover states
- **Loading States** and error handling
- **Toast Notifications** for user feedback

## 🔧 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### **Code Style**
- **ESLint** configuration
- **Prettier** formatting
- **TypeScript** strict mode
- **Component** composition patterns

## 📊 **Data Management**

- **React Query** for server state
- **Zustand** for client state
- **Real-time** updates via WebSocket
- **Optimistic** updates for better UX

## 🚀 **Deployment**

### **Build Process**
```bash
npm run build
npm run start
```

### **Docker Support**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔗 **API Integration**

The control panel integrates with the backend API endpoints:
- **Authentication**: `/api/auth/*`
- **Matches**: `/api/matches/*`
- **Bets**: `/api/undeclare-bets`
- **Users**: `/api/users/*`
- **Casino**: `/api/casino/*`
- **Reports**: `/api/reports/*`

## 📝 **Notes**

- **Refactored** from the old operating panel
- **Preserved** exact UI design and functionality
- **Modernized** with React 18 and Next.js 14
- **Enhanced** with TypeScript and better state management
- **Improved** responsive design and accessibility

## 🤝 **Contributing**

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Maintain the existing UI design
4. Add proper error handling
5. Include loading states
6. Test responsive behavior

## 📄 **License**

This project is part of the 3xBat betting platform. 