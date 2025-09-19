import { Request, Response } from 'express';
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getRoleAccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authHandlers.d.ts.map