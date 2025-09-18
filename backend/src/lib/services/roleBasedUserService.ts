import { UserRole } from '@prisma/client';
import { prisma } from '../prisma';

export function getAvailableRolesForParent(_parentRole: UserRole): UserRole[] {
  return ['USER'] as unknown as UserRole[];
}

export function validateParentChildRole(_parent: UserRole, _child: UserRole): string | null {
  return null;
}

export async function createUserWithRoleValidation(data: any) {
  return { success: true, user: data };
}

export async function updateUserWithRoleValidation(data: any) {
  try {
    const { userId, ...updateData } = data;
    console.log('UpdateUserWithRoleValidation - Received data:', JSON.stringify(data, null, 2));
    
    // Prepare user update data
    const userUpdateData: any = {};
    if (updateData.name !== undefined) userUpdateData.name = updateData.name;
    if (updateData.password !== undefined) userUpdateData.password = updateData.password;
    if (updateData.contactno !== undefined) userUpdateData.contactno = updateData.contactno;
    if (updateData.reference !== undefined) userUpdateData.reference = updateData.reference;
    if (updateData.creditLimit !== undefined) userUpdateData.limit = updateData.creditLimit;
    if (updateData.casinoStatus !== undefined) {
      userUpdateData.casinoStatus = updateData.casinoStatus;
      console.log('Setting casino status:', updateData.casinoStatus);
    }

    console.log('Updating user with data:', userUpdateData);
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      include: {
        userCommissionShare: true
      }
    });
    
    console.log('User updated successfully:', updatedUser);

    // Prepare commission share update data
    const commissionShareData: any = {};
    if (updateData.share !== undefined) commissionShareData.share = updateData.share;
    if (updateData.matchCommission !== undefined) commissionShareData.matchcommission = updateData.matchCommission;
    if (updateData.sessionCommission !== undefined) commissionShareData.sessioncommission = updateData.sessionCommission;
    if (updateData.casinoShare !== undefined) commissionShareData.cshare = updateData.casinoShare;
    if (updateData.casinoCommission !== undefined) commissionShareData.casinocommission = updateData.casinoCommission;
    if (updateData.icshare !== undefined) commissionShareData.icshare = updateData.icshare;
    if (updateData.commissionType !== undefined) commissionShareData.commissionType = updateData.commissionType;
    if (updateData.session_commission_type !== undefined) commissionShareData.session_commission_type = updateData.session_commission_type;
    
    // Handle the field mapping from frontend to database
    if (updateData.matchcommission !== undefined) commissionShareData.matchcommission = updateData.matchcommission;
    if (updateData.sessioncommission !== undefined) commissionShareData.sessioncommission = updateData.sessioncommission;
    if (updateData.casinocommission !== undefined) commissionShareData.casinocommission = updateData.casinocommission;
    if (updateData.casinoCommission !== undefined) commissionShareData.casinocommission = updateData.casinoCommission;

    console.log('Commission share data to update:', commissionShareData);
    
    // Update or create commission share
    if (Object.keys(commissionShareData).length > 0) {
      const existingShare = await prisma.userCommissionShare.findUnique({
        where: { userId: userId }
      });

      if (existingShare) {
        await prisma.userCommissionShare.update({
          where: { userId: userId },
          data: {
            ...commissionShareData,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.userCommissionShare.create({
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
    const finalUser = await prisma.user.findUnique({
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
  } catch (error) {
    console.error('Error updating user with role validation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
