import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtClaims;
  }
}

export type JwtClaims = {
  user_id: number;
  google_id: string;
};

export type JwtPayload = JwtClaims & {
  iat: number;
  exp: number;
};

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado no ambiente');
  }
  return secret;
};

export const signJwt = (claims: JwtClaims): string => {
  return jwt.sign(claims, getSecret(), { expiresIn: '24h' });
};

export const verifyJwt = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Token inválido');
  }
  return decoded as JwtPayload;
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};
