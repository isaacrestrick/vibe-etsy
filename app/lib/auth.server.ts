import { redirect } from 'react-router';
import { getTokenFromCookie, verifyToken, type JWTPayload } from './auth';

/**
 * Get authenticated user from request cookies
 * Returns null if not authenticated
 */
export function getAuthenticatedUser(request: Request): JWTPayload | null {
  const cookieHeader = request.headers.get('Cookie');
  const token = getTokenFromCookie(cookieHeader);

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export function requireAuth(request: Request): JWTPayload {
  const user = getAuthenticatedUser(request);

  if (!user) {
    throw redirect('/login');
  }

  return user;
}

/**
 * Require admin authentication - redirects to login if not admin
 */
export function requireAdmin(request: Request): JWTPayload {
  const user = requireAuth(request);

  if (!user.isAdmin) {
    throw redirect('/products');
  }

  return user;
}
