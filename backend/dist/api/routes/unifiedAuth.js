"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const unifiedAuthHandlers_1 = require("../handlers/unifiedAuthHandlers");
const router = express_1.default.Router();
// Unified authentication routes
router.post('/unified-login', unifiedAuthHandlers_1.unifiedLogin);
router.post('/unified-logout', unifiedAuthHandlers_1.unifiedLogout);
router.get('/unified-session-check', unifiedAuthHandlers_1.unifiedSessionCheck);
router.get('/unified-role-access', unifiedAuthHandlers_1.unifiedRoleAccess);
exports.default = router;
//# sourceMappingURL=unifiedAuth.js.map