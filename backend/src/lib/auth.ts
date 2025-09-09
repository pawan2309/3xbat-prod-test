export function verifyToken(token: string, secret?: string): any {
  try {
    const jwt = require('jsonwebtoken');
    const s = secret || process.env.JWT_SECRET || 'dev_secret';
    return jwt.verify(token, s);
  } catch {
    return null;
  }
}
