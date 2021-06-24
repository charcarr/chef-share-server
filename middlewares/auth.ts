import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenValid } from './tokenValidation';

const { SECRET_KEY } = process.env;

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // get token
    const authHeaders = req.headers.authorization;
    if (!authHeaders) return res.sendStatus(403);
    const token = authHeaders.split(' ')[1];

    if (!isTokenValid(token)) {
      throw new Error('invalid token');
    }

    const tokenData = jwt.verify(token, SECRET_KEY as string);
    req.body._id = (tokenData as jwt.JwtPayload)._id;

    next();
  } catch (e) {
    res.status(401).end('You need to be logged in first');
  }
};

export default authMiddleware;
