import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
const { isTokenValid } = require('./tokenValidation.ts');
const { SECRET_KEY } = process.env;

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get token
    const authHeaders: string | undefined = req.headers.authorization;
    if (!authHeaders) return res.status(401).send('No auth headers');
    const token: string = authHeaders.split(' ')[1];
    const tokenValid = await isTokenValid(token);
    if (!tokenValid) {
      return res.status(401).send('Token not on list...');
    }
    try {
      let tokenData: { _id: string } = await jwt.verify(token, SECRET_KEY);
      req.body._id = tokenData._id;
      next();
    } catch (e) {
      res.status(401).end('Token expired!');
    }
  } catch (e) {
    res.status(401).end('You need to be logged in first');
  }
};

module.exports = authMiddleware;
