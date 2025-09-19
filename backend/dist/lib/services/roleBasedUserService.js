"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableRolesForParent = getAvailableRolesForParent;
exports.validateParentChildRole = validateParentChildRole;
exports.createUserWithRoleValidation = createUserWithRoleValidation;
exports.updateUserWithRoleValidation = updateUserWithRoleValidation;
function getAvailableRolesForParent(_parentRole) {
    return ['USER'];
}
function validateParentChildRole(_parent, _child) {
    return null;
}
async function createUserWithRoleValidation(data) {
    return { success: true, user: data };
}
async function updateUserWithRoleValidation(data) {
    return { success: true, user: data };
}
//# sourceMappingURL=roleBasedUserService.js.map