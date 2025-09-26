"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// Import user management handlers
const userHandlers_1 = require("../handlers/userHandlers");
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authenticateToken);
// User CRUD routes - require appropriate role level access
router.get('/users', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getUsers);
router.post('/users', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.createUser);
router.get('/users/:id', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getUserById);
router.put('/users/:id', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.updateUser);
router.delete('/users/:id', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.deleteUser);
// User filtering routes - require appropriate role level access
router.get('/users/by-role', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getUsersByRole);
router.get('/users/filtered', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getFilteredUsers);
router.get('/users/role-based', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getRoleBasedUsers);
router.post('/users/role-based', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.createUser);
// User management routes - require appropriate role level access
router.post('/users/update-limit', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.updateUserLimit);
router.post('/users/update-limits', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.updateUserLimits);
router.post('/users/transfer-limit', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.transferLimit);
router.post('/users/update-status', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.updateUserStatus);
router.post('/users/change-password', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.changePassword);
router.post('/users/share-commission', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.shareCommission);
// User financial routes - require appropriate role level access
router.get('/users/:id/ledger', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.getUserLedger);
router.post('/users/:id/manual-ledger', (0, authMiddleware_1.authorizeRole)(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), userHandlers_1.createManualLedger);
exports.default = router;
//# sourceMappingURL=userManagement.js.map