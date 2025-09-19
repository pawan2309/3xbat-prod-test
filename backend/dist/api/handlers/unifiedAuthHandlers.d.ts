import { Request, Response } from 'express';
export declare const unifiedLogin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unifiedLogout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unifiedSessionCheck: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const unifiedRoleAccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=unifiedAuthHandlers.d.ts.map