// token whitelist
let storage = [];

export function validateToken (token) {
  storage.push(token);
}

export function invalidateToken (token) {
  storage = storage.filter((tok) => tok !== token);
}

export function isTokenValid (token) {
  return storage.includes(token);
}
