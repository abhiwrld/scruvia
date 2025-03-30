import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const remember = formData.get('remember') === 'true';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });

    // Authenticate the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401, headers: corsHeaders }
      );
    }

    // Successfully authenticated, now handle the redirect
    if (data.session) {
      // Get the current origin for the redirect URL
      const origin = request.headers.get('origin') || request.nextUrl.origin;
      const redirectUrl = `${origin}/chat`;
      
      // Create a response with a redirect 
      const response = NextResponse.redirect(redirectUrl, { status: 302 });
      
      // Set the auth cookie manually
      // Format: sb-<host>-auth-token=JSON.stringify(session)
      const cookieName = `sb-${supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}-auth-token`;
      const cookieValue = JSON.stringify(data.session);
      const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
      
      // Set the cookie manually
      response.cookies.set({
        name: cookieName,
        value: cookieValue,
        path: '/',
        maxAge: maxAge,
        httpOnly: false, // Needs to be accessible by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      console.log('Login successful, redirecting to chat page');
      return response;
    }

    // Fallback redirect
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const response = NextResponse.redirect(`${origin}/chat`, { status: 302 });
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Server error during login:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
} 