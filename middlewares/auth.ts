import jwt from 'jsonwebtoken';
import { isTokenValid } from './tokenValidation';

const { SECRET_KEY } = process.env;

const authMiddleware = async (req, res, next) => {
  try {
    // get token
    const authHeaders = req.headers.authorization;
    if (!authHeaders) return res.sendStatus(403);
    const token = authHeaders.split(' ')[1];

    if (!isTokenValid(token)) {
      throw new Error('invalid token');
    }

    const tokenData = jwt.verify(token, SECRET_KEY);
    req.body._id = tokenData._id;

    next();
  } catch (e) {
    res.status(401).end('You need to be logged in first');
  }
};

export default authMiddleware;
