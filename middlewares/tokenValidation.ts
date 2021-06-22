// token whitelist
let storage: string[] = [];

export function validateToken (token: string) {
  storage.push(token);
}

export function invalidateToken (token: string) {
  storage = storage.filter((tok) => tok !== token);
}

export function isTokenValid (token: string) {
  return storage.includes(token);
}
