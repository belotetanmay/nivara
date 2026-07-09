import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(bytes));
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected paths
  const isAdminPath = path.startsWith('/admin');
  const isVendorPath = path.startsWith('/vendor');
  const isCustomerPath = path.startsWith('/customer');
  const isLoginPath = path === '/login' || path === '/register';

  if (!isAdminPath && !isVendorPath && !isCustomerPath && !isLoginPath) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie?.value;

  if (token) {
    const payload = parseJwt(token);
    if (!payload || !payload.role || !payload.userId) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const { role } = payload;

    // If logged in, redirect away from login/register pages
    if (isLoginPath) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (role === 'VENDOR') {
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/customer/dashboard', request.url));
      }
    }

    // Role-based access control
    if (isAdminPath && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?unauthorized=true', request.url));
    }
    if (isVendorPath && role !== 'VENDOR') {
      return NextResponse.redirect(new URL('/login?unauthorized=true', request.url));
    }
    if (isCustomerPath && role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/login?unauthorized=true', request.url));
    }

    return NextResponse.next();
  } else {
    // No token, redirect to login if accessing protected routes
    if (isAdminPath || isVendorPath || isCustomerPath) {
      let roleHint = 'customer';
      if (isAdminPath) roleHint = 'admin';
      if (isVendorPath) roleHint = 'vendor';
      
      return NextResponse.redirect(new URL(`/login?role=${roleHint}`, request.url));
    }
    return NextResponse.next();
  }
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/customer/:path*',
    '/login',
    '/register',
  ],
};
