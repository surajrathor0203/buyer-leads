import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Check if the user is authenticated
  if (!session) {
    // If not authenticated and trying to access a protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

// Define which routes are protected
export const config = {
  matcher: [
    '/buyers/:path*',
    '/api/buyers/:path*',
    '/api/export/:path*',
    '/api/import/:path*',
  ],
};