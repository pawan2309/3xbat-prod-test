import express from 'express';
import { PrismaClient } from '@prisma/client';

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

// User CRUD routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// User filtering routes
router.get('/users/by-role', getUsersByRole);
router.get('/users/filtered', getFilteredUsers);
router.get('/users/role-based', getRoleBasedUsers);

// User management routes
router.post('/users/update-limit', updateUserLimit);
router.post('/users/update-limits', updateUserLimits);
router.post('/users/transfer-limit', transferLimit);
router.post('/users/update-status', updateUserStatus);
router.post('/users/change-password', changePassword);
router.post('/users/share-commission', shareCommission);

// User financial routes
router.get('/users/:id/ledger', getUserLedger);
router.post('/users/:id/manual-ledger', createManualLedger);

export default router;
