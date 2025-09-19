import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                name: string | null;
                role: string;
                status: string;
            };
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const authorizeRole: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const roleDescriptions: {
    USER: string;
    AGENT: string;
    SUP_AGENT: string;
    MAS_AGENT: string;
    SUB_ADM: string;
    ADMIN: string;
    SUP_ADM: string;
    SUB_OWN: string;
    OWNER: string;
};
export declare const hasRolePermission: (userRole: string, requiredRole: string) => boolean;
export declare const getRoleLevel: (role: string) => number;
export declare const getRoleDescription: (role: string) => string;
export declare const canAccessRole: (targetRole: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map