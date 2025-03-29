import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function has been modified to enforce authentication checks for protected routes
export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/chat') || request.nextUrl.pathname.startsWith('/pricing')) {
    // Check if user is authenticated
    const isAuthenticated = request.cookies.get('auth_user_id')?.value;
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Keeping the matcher config to enforce redirects for protected routes
export const config = {
  matcher: ['/pricing/:path*', '/chat/:path*'],
};
