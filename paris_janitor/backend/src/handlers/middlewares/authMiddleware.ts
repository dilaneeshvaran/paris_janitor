import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { tokenRevocationList } from '../routes/user-routes';

interface RequestWithUser extends Request {
  user?: any;
  token?:any;
}

export function authenticateToken(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    if (tokenRevocationList.includes(token)) return res.sendStatus(401)

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        req.token = token  // Attach the token to the req object
        next()
    })
}

export function authorizeAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send({ message: "Forbidden: only admins can perform this action" });
    }
}
export function authorizeAdminOrOwner(req: RequestWithUser, res: Response, next: NextFunction) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'client')) {
        next();
    } else {
        res.status(403).send({ message: "Forbidden: only admins or clients can perform this action" });
    }
}

export function authorizeAll(req: RequestWithUser, res: Response, next: NextFunction) {
    if (req.user) {
        next();
    } else {
        res.status(403).send({ message: "Forbidden: only authenticated users can perform this action" });
    }
}