// token whitelist
const Token = require('../models/token');

async function validateToken(token: string) {
  const newToken = new Token({ token });
  await newToken.save();
}

async function invalidateToken(token: string) {
  await Token.deleteOne({ token });
}

async function isTokenValid(token: string) {
  let storage: any = await Token.findOne({ token });
  return storage ? true : false;
}

module.exports = {
  validateToken,
  isTokenValid,
  invalidateToken,
};
