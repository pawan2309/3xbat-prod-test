import { UserRole } from '@prisma/client';
export declare function getAvailableRolesForParent(_parentRole: UserRole): UserRole[];
export declare function validateParentChildRole(_parent: UserRole, _child: UserRole): string | null;
export declare function createUserWithRoleValidation(data: any): Promise<{
    success: boolean;
    user: any;
}>;
export declare function updateUserWithRoleValidation(data: any): Promise<{
    success: boolean;
    user: ({
        userCommissionShare: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            share: number;
            cshare: number;
            casinocommission: number;
            matchcommission: number;
            sessioncommission: number;
            session_commission_type: string;
            commissionType: string | null;
            available_share_percent: number;
        } | null;
        parent: {
            id: string;
            username: string;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        } | null;
    } & {
        id: string;
        username: string;
        password: string;
        name: string | null;
        contactno: string | null;
        reference: string | null;
        limit: number;
        exposure: number;
        casinoStatus: boolean | null;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        parentId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    user?: undefined;
}>;
//# sourceMappingURL=roleBasedUserService.d.ts.map