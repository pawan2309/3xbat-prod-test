"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableRolesForParent = getAvailableRolesForParent;
exports.validateParentChildRole = validateParentChildRole;
exports.createUserWithRoleValidation = createUserWithRoleValidation;
exports.updateUserWithRoleValidation = updateUserWithRoleValidation;
const prisma_1 = require("../prisma");
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
    try {
        const { userId, ...updateData } = data;
        console.log('UpdateUserWithRoleValidation - Received data:', JSON.stringify(data, null, 2));
        // Prepare user update data
        const userUpdateData = {};
        if (updateData.name !== undefined)
            userUpdateData.name = updateData.name;
        if (updateData.password !== undefined)
            userUpdateData.password = updateData.password;
        if (updateData.contactno !== undefined)
            userUpdateData.contactno = updateData.contactno;
        if (updateData.reference !== undefined)
            userUpdateData.reference = updateData.reference;
        if (updateData.creditLimit !== undefined)
            userUpdateData.limit = updateData.creditLimit;
        if (updateData.casinoStatus !== undefined) {
            userUpdateData.casinoStatus = updateData.casinoStatus;
            console.log('Setting casino status:', updateData.casinoStatus);
        }
        console.log('Updating user with data:', userUpdateData);
        // Update user
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: userUpdateData,
            include: {
                userCommissionShare: true
            }
        });
        console.log('User updated successfully:', updatedUser);
        // Prepare commission share update data
        const commissionShareData = {};
        if (updateData.share !== undefined)
            commissionShareData.share = updateData.share;
        if (updateData.matchCommission !== undefined)
            commissionShareData.matchcommission = updateData.matchCommission;
        if (updateData.sessionCommission !== undefined)
            commissionShareData.sessioncommission = updateData.sessionCommission;
        if (updateData.casinoShare !== undefined)
            commissionShareData.cshare = updateData.casinoShare;
        if (updateData.casinoCommission !== undefined)
            commissionShareData.casinocommission = updateData.casinoCommission;
        if (updateData.icshare !== undefined)
            commissionShareData.icshare = updateData.icshare;
        if (updateData.commissionType !== undefined)
            commissionShareData.commissionType = updateData.commissionType;
        if (updateData.session_commission_type !== undefined)
            commissionShareData.session_commission_type = updateData.session_commission_type;
        // Handle the field mapping from frontend to database
        if (updateData.matchcommission !== undefined)
            commissionShareData.matchcommission = updateData.matchcommission;
        if (updateData.sessioncommission !== undefined)
            commissionShareData.sessioncommission = updateData.sessioncommission;
        if (updateData.casinocommission !== undefined)
            commissionShareData.casinocommission = updateData.casinocommission;
        if (updateData.casinoCommission !== undefined)
            commissionShareData.casinocommission = updateData.casinoCommission;
        console.log('Commission share data to update:', commissionShareData);
        // Update or create commission share
        if (Object.keys(commissionShareData).length > 0) {
            const existingShare = await prisma_1.prisma.userCommissionShare.findUnique({
                where: { userId: userId }
            });
            if (existingShare) {
                await prisma_1.prisma.userCommissionShare.update({
                    where: { userId: userId },
                    data: {
                        ...commissionShareData,
                        updatedAt: new Date()
                    }
                });
            }
            else {
                await prisma_1.prisma.userCommissionShare.create({
                    data: {
                        userId: userId,
                        ...commissionShareData,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            }
        }
        // Get updated user with commission share
        const finalUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userCommissionShare: true,
                parent: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true
                    }
                }
            }
        });
        return { success: true, user: finalUser };
    }
    catch (error) {
        console.error('Error updating user with role validation:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
//# sourceMappingURL=roleBasedUserService.js.map