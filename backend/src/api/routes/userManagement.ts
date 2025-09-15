import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRole } from '../../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

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

// User CRUD routes - require admin level access
router.get('/users', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getUsers);
router.post('/users', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), createUser);
router.get('/users/:id', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getUserById);
router.put('/users/:id', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), updateUser);
router.delete('/users/:id', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), deleteUser);

// User filtering routes - require admin level access
router.get('/users/by-role', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getUsersByRole);
router.get('/users/filtered', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getFilteredUsers);
router.get('/users/role-based', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getRoleBasedUsers);

// User management routes - require admin level access
router.post('/users/update-limit', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), updateUserLimit);
router.post('/users/update-limits', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), updateUserLimits);
router.post('/users/transfer-limit', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), transferLimit);
router.post('/users/update-status', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), updateUserStatus);
router.post('/users/change-password', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), changePassword);
router.post('/users/share-commission', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), shareCommission);

// User financial routes - require admin level access
router.get('/users/:id/ledger', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), getUserLedger);
router.post('/users/:id/manual-ledger', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'SUB_OWNER']), createManualLedger);

export default router;
