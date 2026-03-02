import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'myload24secretkey123';

export interface JwtPayload {
    userId: string;
    phone: string;
    role: string;
}

export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}

export function roleMiddleware(role: string | string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as JwtPayload;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const allowedRoles = Array.isArray(role) ? role : [role];
        if (user.role === 'admin' || allowedRoles.includes(user.role)) {
            return next();
        }

        return res.status(403).json({ error: `Forbidden: Requires ${allowedRoles.join(' or ')} role` });
    };
}
