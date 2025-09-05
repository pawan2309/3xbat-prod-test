import express from 'express';
import { 
  login, 
  logout, 
  getSession, 
  getProfile, 
  refreshToken, 
  getRoleAccess 
} from '../handlers/authHandlers';

const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/logout', logout);
router.get('/session', getSession);
router.get('/profile', getProfile);
router.post('/refresh', refreshToken);
router.get('/role-access', getRoleAccess);

export default router;
