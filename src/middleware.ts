import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function enforces authentication checks for protected routes
export function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/chat') || request.nextUrl.pathname.startsWith('/pricing')) {
    // Check if user is authenticated via cookie
    const isAuthenticated = request.cookies.get('auth_user_id')?.value;
    
    if (!isAuthenticated) {
      // Before redirecting, check if there's a recovery in progress
      const url = new URL(request.url);
      const recoverParam = url.searchParams.get('recover');
      
      if (recoverParam) {
        // Allow this request as it's part of a recovery process
        console.log('Recovery process detected, allowing access');
        return NextResponse.next();
      }
      
      // Redirect to login page if not authenticated
      const loginUrl = new URL('/login', request.url);
      
      // Add a flag to indicate we came from a protected route
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

// Keeping the matcher config to enforce redirects for protected routes
export const config = {
  matcher: ['/pricing/:path*', '/chat/:path*'],
};
