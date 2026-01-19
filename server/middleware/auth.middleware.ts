import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

interface JwtPayload {
    id : number;
    username : string;
}

export interface AuthRequest extends Request {
    user? : JwtPayload;
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) : void => {
    const authHeader = req.headers['authorization'];

    //extract token from header
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        res.status(401).json({error: 'Access denied.No token provided'});
        return;
    }

    const JWT_SECRET: string  = process.env.JWT_SECRET || 'fallback_test_secret';

    if(!JWT_SECRET){
        console.error('FATAL ERROR: JWT_SECRET is not defined');
        res.status(500).json({error: 'Internal server error'});
        return;
    }

    jwt.verify(token, JWT_SECRET , (err: VerifyErrors | null,decoded: unknown) => {
        if(err){
            return res.status(403).json({error: 'Invalid or expired token.'});
        }

        if(decoded && typeof decoded === 'object' && 'id' in decoded){
            req.user = decoded as JwtPayload;
            next();
        }else{
            res.status(403).json({error: 'Invalid token payload.'});
        }
        
    })
}