/**
 * Token Debugging Utilities
 */

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== 'number') return true;
  
  const exp = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() > exp;
}

export function getTokenInfo(token: string) {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    userId: typeof decoded.user_id === 'string' ? decoded.user_id : typeof decoded.sub === 'string' ? decoded.sub : null,
    email: typeof decoded.email === 'string' ? decoded.email : null,
    tokenType: typeof decoded.token_type === 'string' ? decoded.token_type : null,
    issuedAt: typeof decoded.iat === 'number' ? new Date(decoded.iat * 1000).toLocaleString() : null,
    expiresAt: typeof decoded.exp === 'number' ? new Date(decoded.exp * 1000).toLocaleString() : null,
    isExpired: isTokenExpired(token),
  };
}

export function debugToken() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('❌ No token found in localStorage');
    return null;
  }
  
  const info = getTokenInfo(token);
  console.log('=== TOKEN DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token info:', info);
  console.log('Is expired:', info?.isExpired);
  
  if (info?.isExpired) {
    console.log('⚠️ TOKEN IS EXPIRED! Please login again.');
  }
  
  return info;
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  console.log('✅ Auth cleared. Please reload and login again.');
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.log('❌ No refresh token available');
    return false;
  }
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (!apiUrl) {
      console.error('❌ NEXT_PUBLIC_API_GATEWAY_URL not configured');
      return false;
    }
    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      console.log('❌ Token refresh failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    const newToken = data.data?.access_token || data.access_token;
    
    if (newToken) {
      localStorage.setItem('access_token', newToken);
      console.log('✅ Token refreshed successfully!');
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('❌ Token refresh error:', e);
    return false;
  }
}

// Auto-run debug
debugToken();
