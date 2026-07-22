import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  console.log('[Backend Auth] Verifying Token:', token.substring(0, 15) + '...');
  console.log('[Backend Auth] Using JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 0);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any as TokenPayload;
    console.log('[Backend Auth] Token Verified Successfully! Payload:', JSON.stringify(decoded));
    return decoded;
  } catch (error: any) {
    console.error('[Backend Auth] Token Verification Failed! Error:', error.message || error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractToken(request: Request): string | null {
  console.log('[Backend Auth] Request URL:', request.url);
  console.log('[Backend Auth] Request Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));

  // 1. Try to read from Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('[Backend Auth] Extracted from Auth Header:', token.substring(0, 15) + '...');
    return token;
  }

  // 2. Try to read from Cookies (Fallback for web)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    if (match) {
      const token = decodeURIComponent(match[1]);
      console.log('[Backend Auth] Extracted from Cookies:', token.substring(0, 15) + '...');
      return token;
    }
  }

  console.log('[Backend Auth] No token found in request!');
  return null;
}

