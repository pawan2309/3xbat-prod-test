"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const roleBasedUserService_1 = require("../../lib/services/roleBasedUserService");
async function handler(req, res) {
    if (req.method === 'POST') {
        // Create user with role validation
        try {
            const { name, password, contactno, reference, creditLimit, role, parentId, share, matchCommission, casinoCommission, commissionType, casinoStatus, casinoShare, myMatchCommission, mySessionCommission, myCasinoCommission, myCasinoShare } = req.body;
            // Validate required fields
            if (!name || !password || !role || !parentId || share === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, password, role, parentId, and share are required'
                });
            }
            const result = await (0, roleBasedUserService_1.createUserWithRoleValidation)({
                name,
                password,
                contactno,
                reference,
                creditLimit: creditLimit ? Number(creditLimit) : 0,
                role: role,
                parentId,
                share: Number(share),
                matchCommission: matchCommission ? Number(matchCommission) : 0,
                casinoCommission: casinoCommission ? Number(casinoCommission) : 0,
                commissionType: commissionType || 'NoCommission',
                casinoStatus: casinoStatus === true || casinoStatus === 'true',
                casinoShare: casinoShare ? Number(casinoShare) : 0,
                myMatchCommission: myMatchCommission ? Number(myMatchCommission) : undefined,
                mySessionCommission: mySessionCommission ? Number(mySessionCommission) : undefined,
                myCasinoCommission: myCasinoCommission ? Number(myCasinoCommission) : undefined,
                myCasinoShare: myCasinoShare ? Number(myCasinoShare) : undefined
            });
            if (result.success) {
                return res.status(201).json({
                    success: true,
                    user: result.user,
                    message: 'User created successfully'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to create user'
                });
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    if (req.method === 'PUT') {
        // Update user with role validation
        try {
            const { userId, ...updateData } = req.body;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
            const result = await (0, roleBasedUserService_1.updateUserWithRoleValidation)({
                userId,
                name: updateData.name,
                password: updateData.password,
                contactno: updateData.contactno,
                reference: updateData.reference,
                creditLimit: updateData.creditLimit ? Number(updateData.creditLimit) : undefined,
                share: updateData.share ? Number(updateData.share) : undefined,
                matchCommission: updateData.matchCommission ? Number(updateData.matchCommission) : undefined,
                casinoCommission: updateData.casinoCommission ? Number(updateData.casinoCommission) : undefined,
                commissionType: updateData.commissionType,
                casinoStatus: updateData.casinoStatus === true || updateData.casinoStatus === 'true',
                casinoShare: updateData.casinoShare ? Number(updateData.casinoShare) : undefined,
                myMatchCommission: updateData.myMatchCommission ? Number(updateData.myMatchCommission) : undefined,
                mySessionCommission: updateData.mySessionCommission ? Number(updateData.mySessionCommission) : undefined,
                myCasinoCommission: updateData.myCasinoCommission ? Number(updateData.myCasinoCommission) : undefined,
                myCasinoShare: updateData.myCasinoShare ? Number(updateData.myCasinoShare) : undefined
            });
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    user: result.user,
                    message: 'User updated successfully'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update user'
                });
            }
        }
        catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    if (req.method === 'GET') {
        // Get available roles for a parent
        try {
            const { parentRole } = req.query;
            if (!parentRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent role is required'
                });
            }
            const availableRoles = (0, roleBasedUserService_1.getAvailableRolesForParent)(parentRole);
            return res.status(200).json({
                success: true,
                availableRoles,
                parentRole
            });
        }
        catch (error) {
            console.error('Error getting available roles:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get available roles',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    if (req.method === 'PATCH') {
        // Validate role combination
        try {
            const { parentRole, childRole } = req.body;
            if (!parentRole || !childRole) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent role and child role are required'
                });
            }
            const validationError = (0, roleBasedUserService_1.validateParentChildRole)(parentRole, childRole);
            return res.status(200).json({
                success: true,
                valid: !validationError,
                error: validationError || null
            });
        }
        catch (error) {
            console.error('Error validating role combination:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to validate role combination',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    return res.status(405).json({
        success: false,
        message: 'Method not allowed'
    });
}
//# sourceMappingURL=role-based.js.map