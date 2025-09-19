import { Request, Response } from 'express';
export declare const getUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUsersByRole: (req: Request, res: Response) => Promise<void>;
export declare const getFilteredUsers: (req: Request, res: Response) => Promise<void>;
export declare const getRoleBasedUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateUserLimit: (req: Request, res: Response) => Promise<void>;
export declare const updateUserLimits: (req: Request, res: Response) => Promise<void>;
export declare const transferLimit: (req: Request, res: Response) => Promise<void>;
export declare const updateUserStatus: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
export declare const shareCommission: (req: Request, res: Response) => Promise<void>;
export declare const getUserLedger: (req: Request, res: Response) => Promise<void>;
export declare const createManualLedger: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userHandlers.d.ts.map