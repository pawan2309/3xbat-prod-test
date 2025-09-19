"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibleRoles = getAccessibleRoles;
exports.getRoleBasedNavigation = getRoleBasedNavigation;
exports.canAccessFeature = canAccessFeature;
exports.canAccessRole = canAccessRole;
const roleOrder = [
    'OWNER',
    'SUB_OWN',
    'SUP_ADM',
    'ADMIN',
    'SUB_ADM',
    'MAS_AGENT',
    'SUP_AGENT',
    'AGENT',
    'USER',
];
function getAccessibleRoles(role) {
    const idx = roleOrder.indexOf(role);
    if (idx === -1)
        return [];
    return roleOrder.slice(idx); // can access own and below
}
function getRoleBasedNavigation(_role) {
    return {
        dashboard: true,
        users: true,
        reports: true,
    };
}
function canAccessFeature(role, feature) {
    if (feature === 'login_reports')
        return roleOrder.indexOf(role) <= roleOrder.indexOf('SUB_ADM');
    return true;
}
function canAccessRole(actorRole, targetRole) {
    return roleOrder.indexOf(actorRole) <= roleOrder.indexOf(targetRole);
}
//# sourceMappingURL=hierarchyUtils.js.map