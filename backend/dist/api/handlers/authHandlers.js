"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleAccess = exports.refreshToken = exports.getProfile = exports.getSession = exports.logout = exports.login = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'L9vY7z!pQkR#eA1dT3u*Xj5@FbNmC2Ws';
// POST /api/auth/login - User login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                userCommissionShare: true
            }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        // Check if user is active
        if (user.status !== 'ACTIVE') {
            return res.status(401).json({ success: false, message: 'Account is inactive' });
        }
        // Verify password (plain text comparison)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status
            }
        }, JWT_SECRET, {
            expiresIn: '24h'
        });
        // Set cookie
        res.cookie('betx_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        console.log('✅ Login successful for user:', user.username, 'Role:', user.role);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status,
                limit: user.limit,
                casinoStatus: user.casinoStatus,
                userCommissionShare: user.userCommissionShare
            },
            token
        });
        // ORIGINAL LOGIN CODE - COMMENTED OUT FOR TESTING
        // // Find user by username
        // const user = await prisma.user.findUnique({
        //   where: { username },
        //   include: {
        //     UserCommissionShare: true
        //   }
        // });
        // if (!user) {
        //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
        // }
        // // Check password (stored in plain text for credential sharing)
        // if (user.password !== password) {
        //   return res.status(401).json({ success: false, message: 'Invalid credentials' });
        // }
        // // Check if user is active
        // if (!user.isActive) {
        //   return res.status(401).json({ success: false, message: 'Account is deactivated' });
        // }
        // // Generate JWT token
        // const token = jwt.sign(
        //   { 
        //     user: {
        //       id: user.id,
        //       username: user.username,
        //       name: user.name,
        //       role: user.role
        //     },
        //     userId: user.id,
        //     id: user.id,
        //     username: user.username,
        //     role: user.role
        //   },
        //   JWT_SECRET,
        //   { expiresIn: '24h' }
        // );
        // // Set cookie
        // res.cookie('betx_session', token, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === 'production',
        //   sameSite: 'lax',
        //   maxAge: 24 * 60 * 60 * 1000 // 24 hours
        // });
        // return res.status(200).json({
        //   success: true,
        //   message: 'Login successful',
        //   user: {
        //     id: user.id,
        //     username: user.username,
        //     name: user.name,
        //     role: user.role
        //   },
        //   token
        // });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.login = login;
// POST /api/auth/logout - User logout
const logout = async (req, res) => {
    try {
        // Clear the session cookie
        res.clearCookie('betx_session');
        return res.status(200).json({ success: true, message: 'Logout successful' });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.logout = logout;
// GET /api/auth/unified-session-check - Get current session
const getSession = async (req, res) => {
    try {
        // Get token from cookie
        const authToken = req.cookies.betx_session;
        console.log('🔍 Session API: Checking for auth token');
        if (!authToken) {
            console.log('❌ No auth token found in cookies');
            return res.status(401).json({ valid: false, message: 'No authentication token' });
        }
        console.log('🔍 Token content (first 20 chars):', authToken.substring(0, 20) + '...');
        // Verify JWT token
        let decoded;
        try {
            console.log('🔍 Verifying JWT token...');
            const JWT_SECRET = process.env.JWT_SECRET;
            if (!JWT_SECRET) {
                console.error('❌ JWT_SECRET environment variable not set');
                return res.status(500).json({ valid: false, message: 'Server configuration error' });
            }
            decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
            console.log('✅ JWT token verified successfully:', {
                userId: decoded.user?.id || decoded.userId,
                username: decoded.user?.username || decoded.username,
                role: decoded.user?.role || decoded.role
            });
        }
        catch (error) {
            console.log('❌ Invalid JWT token:', error);
            return res.status(401).json({ valid: false, message: 'Invalid token' });
        }
        // Get user from database
        const userId = decoded.user?.id || decoded.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                status: true
            }
        });
        if (!user) {
            console.log('❌ User not found for token');
            return res.status(401).json({ valid: false, message: 'User not found' });
        }
        // Check if user is still active
        if (user.status !== 'ACTIVE') {
            console.log('❌ User account not active:', user.username);
            return res.status(401).json({ valid: false, message: 'Account not active' });
        }
        console.log('✅ Valid session for user:', user.username, 'Role:', user.role);
        // Return user session data
        return res.status(200).json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('💥 Session validation error:', error);
        return res.status(500).json({ valid: false, message: 'Internal server error' });
    }
};
exports.getSession = getSession;
// GET /api/auth/profile - Get user profile
const getProfile = async (req, res) => {
    try {
        // Get session from cookie
        const session = req.cookies['betx_session'];
        if (!session) {
            return res.status(401).json({ success: false, message: 'No session found' });
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(session, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
        const userId = decoded.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not found in session' });
        }
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userCommissionShare: true
            }
        });
        if (!user || user.status !== 'ACTIVE') {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status,
                limit: user.limit,
                casinoStatus: user.casinoStatus,
                userCommissionShare: user.userCommissionShare
            }
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
// POST /api/auth/refresh - Refresh token
const refreshToken = async (req, res) => {
    try {
        // Get current token from cookie
        const currentToken = req.cookies.betx_session;
        if (!currentToken) {
            return res.status(401).json({ success: false, message: 'No token to refresh' });
        }
        // Verify current token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(currentToken, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        // Get user from database to ensure they still exist and are active
        const userId = decoded.user?.id || decoded.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                status: true
            }
        });
        if (!user || user.status !== 'ACTIVE') {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }
        // Generate new token
        const newToken = jsonwebtoken_1.default.sign({
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status
            }
        }, JWT_SECRET, { expiresIn: '24h' });
        // Set new cookie
        res.cookie('betx_session', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ success: true, token: newToken });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.refreshToken = refreshToken;
// GET /api/auth/role-access - Get role access
const getRoleAccess = async (req, res) => {
    try {
        // Get token from cookie
        const authToken = req.cookies.betx_session;
        if (!authToken) {
            return res.status(401).json({ success: false, message: 'No authentication token' });
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        const userRole = decoded.user?.role || decoded.role;
        // Define role hierarchy and permissions (1 = highest authority)
        const roleHierarchy = {
            'OWNER': {
                level: 1,
                accessibleRoles: ['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['all']
            },
            'SUB_OWN': {
                level: 2,
                accessibleRoles: ['SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management', 'limit_management', 'commission_management', 'reporting', 'admin_panel']
            },
            'SUP_ADM': {
                level: 3,
                accessibleRoles: ['SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management', 'limit_management', 'commission_management', 'reporting']
            },
            'ADMIN': {
                level: 4,
                accessibleRoles: ['ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management', 'limit_management', 'reporting']
            },
            'SUB_ADM': {
                level: 5,
                accessibleRoles: ['SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management', 'reporting']
            },
            'MAS_AGENT': {
                level: 6,
                accessibleRoles: ['MAS_AGENT', 'SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management']
            },
            'SUP_AGENT': {
                level: 7,
                accessibleRoles: ['SUP_AGENT', 'AGENT', 'USER'],
                permissions: ['user_management']
            },
            'AGENT': {
                level: 8,
                accessibleRoles: ['AGENT', 'USER'],
                permissions: ['user_management']
            },
            'USER': {
                level: 9,
                accessibleRoles: ['USER'],
                permissions: []
            }
        };
        const roleAccess = roleHierarchy[userRole] || roleHierarchy['USER'];
        return res.status(200).json({
            success: true,
            roleAccess: {
                canAccessAll: roleAccess.permissions.includes('all'),
                accessibleRoles: roleAccess.accessibleRoles,
                permissions: roleAccess.permissions,
                userRole: userRole,
                level: roleAccess.level
            }
        });
    }
    catch (error) {
        console.error('Role access error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getRoleAccess = getRoleAccess;
//# sourceMappingURL=authHandlers.js.map