"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifiedRoleAccess = exports.unifiedSessionCheck = exports.unifiedLogout = exports.unifiedLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const roleHierarchy_1 = require("../../shared/utils/roleHierarchy");
const domainAccess_1 = require("../../shared/utils/domainAccess");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'L9vY7z!pQkR#eA1dT3u*Xj5@FbNmC2Ws';
// Unified login handler for all panels
const unifiedLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        // Find user in database
        const user = await prisma.user.findFirst({
            where: {
                username: username
            },
            include: {
                userCommissionShare: true
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        // Check password (temporarily using plain text for existing users)
        // TODO: Implement proper password hashing for new users
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        // Check if user is active
        if (user.status !== 'ACTIVE') {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive. Please contact administrator.'
            });
        }
        // Generate JWT token
        const tokenPayload = {
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status
            }
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
        // Get role-based navigation and permissions
        const navigation = (0, roleHierarchy_1.getRoleBasedNavigation)(user.role);
        const accessibleRoles = (0, roleHierarchy_1.getAccessibleRoles)(user.role);
        // Check domain redirection (only in production)
        const currentDomain = req.get('host') || '';
        const redirectInfo = process.env.NODE_ENV === 'production'
            ? (0, domainAccess_1.shouldRedirect)(user.role, currentDomain)
            : { shouldRedirect: false, targetDomain: currentDomain };
        // Set HTTP-only cookie (only once)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/',
            // Don't set domain in development to allow localhost cookies
            ...(process.env.NODE_ENV === 'production' && { domain: '.3xbat.com' })
        };
        console.log('🍪 Setting cookie with options:', cookieOptions);
        console.log('🍪 Request host:', req.get('host'));
        console.log('🍪 Request origin:', req.get('origin'));
        res.cookie('betx_session', token, cookieOptions);
        console.log('🍪 Cookie set successfully');
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
                contactno: user.contactno,
                userCommissionShare: user.userCommissionShare
            },
            token,
            navigation,
            accessibleRoles,
            redirectInfo
        });
    }
    catch (error) {
        console.error('Unified login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.unifiedLogin = unifiedLogin;
// Unified logout handler for all panels
const unifiedLogout = async (req, res) => {
    try {
        // Get user info from token before clearing (for logging)
        let userInfo = null;
        try {
            const authToken = req.cookies.betx_session;
            if (authToken) {
                const decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
                userInfo = decoded.user;
            }
        }
        catch (error) {
            // Token might be invalid, but we still want to clear the cookie
            console.log('Token verification failed during logout:', error);
        }
        // Clear the session cookie with multiple path options to ensure complete cleanup
        const clearCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0, // Immediately expire the cookie
            // Don't set domain in development to allow localhost cookies
            ...(process.env.NODE_ENV === 'production' && { domain: '.3xbat.com' })
        };
        console.log('🍪 Clearing session cookie with options:', clearCookieOptions);
        res.clearCookie('betx_session', clearCookieOptions);
        // Also clear any potential variations of the cookie
        res.clearCookie('betx_session', {
            ...clearCookieOptions,
            sameSite: 'strict'
        });
        // Clear with different path variations
        res.clearCookie('betx_session', {
            ...clearCookieOptions,
            path: '/api'
        });
        // Set an empty cookie to ensure it's cleared
        res.cookie('betx_session', '', {
            ...clearCookieOptions,
            expires: new Date(0)
        });
        // Log logout event
        if (userInfo) {
            console.log(`🚪 User ${userInfo.username} (${userInfo.role}) logged out from ${req.get('host') || 'unknown'}`);
        }
        else {
            console.log('🚪 Anonymous logout request from', req.get('host') || 'unknown');
        }
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Unified logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
};
exports.unifiedLogout = unifiedLogout;
// Unified session check handler
const unifiedSessionCheck = async (req, res) => {
    try {
        console.log('🔍 Session check: Request cookies:', req.cookies);
        const authToken = req.cookies.betx_session;
        console.log('🔍 Session check: Auth token present:', !!authToken);
        if (!authToken) {
            console.log('🔍 Session check: No auth token found');
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'No authentication token'
            });
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'Invalid or expired token'
            });
        }
        // Get user from database to ensure they still exist and are active
        const userId = decoded.user?.id || decoded.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userCommissionShare: true
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'User not found'
            });
        }
        if (user.status !== 'ACTIVE') {
            return res.status(401).json({
                success: false,
                valid: false,
                message: 'Account is inactive'
            });
        }
        // Get role-based navigation and permissions
        console.log('🔍 Getting navigation for role:', user.role);
        const navigation = (0, roleHierarchy_1.getRoleBasedNavigation)(user.role);
        console.log('🔍 Navigation result:', Object.keys(navigation));
        const accessibleRoles = (0, roleHierarchy_1.getAccessibleRoles)(user.role);
        return res.status(200).json({
            success: true,
            valid: true,
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status,
                limit: user.limit,
                contactno: user.contactno,
                userCommissionShare: user.userCommissionShare
            },
            navigation,
            accessibleRoles
        });
    }
    catch (error) {
        console.error('Unified session check error:', error);
        return res.status(500).json({
            success: false,
            valid: false,
            message: 'Internal server error'
        });
    }
};
exports.unifiedSessionCheck = unifiedSessionCheck;
// Role access handler
const unifiedRoleAccess = async (req, res) => {
    try {
        const authToken = req.cookies.betx_session;
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token'
            });
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(authToken, JWT_SECRET);
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
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
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        // Get role-based access information
        const navigation = (0, roleHierarchy_1.getRoleBasedNavigation)(user.role);
        const accessibleRoles = (0, roleHierarchy_1.getAccessibleRoles)(user.role);
        // Build feature access object
        const featureAccess = {};
        const features = [
            'login_reports',
            'super_admin_management',
            'admin_management',
            'sub_owner_management',
            'sub_management',
            'master_management',
            'super_agent_management',
            'agent_management',
            'client_management'
        ];
        features.forEach(feature => {
            featureAccess[feature] = (0, roleHierarchy_1.canAccessFeature)(user.role, feature);
        });
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            },
            access: {
                accessibleRoles,
                navigation,
                featureAccess,
                accessibleUsersByRole: {} // This would be populated based on specific needs
            }
        });
    }
    catch (error) {
        console.error('Unified role access error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.unifiedRoleAccess = unifiedRoleAccess;
//# sourceMappingURL=unifiedAuthHandlers.js.map