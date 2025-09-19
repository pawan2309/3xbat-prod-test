"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authHandlers_1 = require("../handlers/authHandlers");
const router = express_1.default.Router();
// Authentication routes
router.post('/login', authHandlers_1.login);
router.post('/logout', authHandlers_1.logout);
router.get('/session', authHandlers_1.getSession);
router.get('/profile', authHandlers_1.getProfile);
router.post('/refresh', authHandlers_1.refreshToken);
router.get('/role-access', authHandlers_1.getRoleAccess);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map