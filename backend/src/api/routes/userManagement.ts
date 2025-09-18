import express from 'express';
import { authenticateToken, authorizeRole } from '../../middleware/authMiddleware';

const router = express.Router();

// Import user management handlers
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserById,
  getUsersByRole,
  getFilteredUsers,
  getRoleBasedUsers,
  updateUserLimit,
  updateUserLimits,
  transferLimit,
  updateUserStatus,
  changePassword,
  shareCommission,
  getUserLedger,
  createManualLedger
} from '../handlers/userHandlers';

// Apply authentication middleware to all routes
router.use(authenticateToken);

// User CRUD routes - require appropriate role level access
router.get('/users', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getUsers);
router.post('/users', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), createUser);
router.get('/users/:id', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getUserById);
router.put('/users/:id', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), updateUser);
router.delete('/users/:id', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), deleteUser);

// User filtering routes - require appropriate role level access
router.get('/users/by-role', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getUsersByRole);
router.get('/users/filtered', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getFilteredUsers);
router.get('/users/role-based', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getRoleBasedUsers);
router.post('/users/role-based', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), createUser);

// User management routes - require appropriate role level access
router.post('/users/update-limit', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), updateUserLimit);
router.post('/users/update-limits', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), updateUserLimits);
router.post('/users/transfer-limit', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), transferLimit);
router.post('/users/update-status', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), updateUserStatus);
router.post('/users/change-password', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), changePassword);
router.post('/users/share-commission', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), shareCommission);

// User financial routes - require appropriate role level access
router.get('/users/:id/ledger', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), getUserLedger);
router.post('/users/:id/manual-ledger', authorizeRole(['OWNER', 'SUB_OWN', 'SUP_ADM', 'ADMIN', 'SUB_ADM', 'MAS_AGENT', 'SUP_AGENT', 'AGENT']), createManualLedger);

export default router;
