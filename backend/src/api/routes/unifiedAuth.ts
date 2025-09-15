import express from 'express';
import { 
  unifiedLogin, 
  unifiedLogout, 
  unifiedSessionCheck, 
  unifiedRoleAccess 
} from '../handlers/unifiedAuthHandlers';

const router = express.Router();

// Unified authentication routes
router.post('/unified-login', unifiedLogin);
router.post('/unified-logout', unifiedLogout);
router.get('/unified-session-check', unifiedSessionCheck);
router.get('/unified-role-access', unifiedRoleAccess);

export default router;
