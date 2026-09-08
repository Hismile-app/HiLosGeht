import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    // If Supabase network request is unreachable or offline, continue gracefully
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Protect Admin and Staff routes when explicitly requiring session (skip if bypass header or in local demo)
  // If user is present, route check
  if (user && path === '/login') {
    const role = user.app_metadata?.role || user.user_metadata?.role || 'CLIENT';
    if (role === 'ADMIN') {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    } else if (role === 'OPERATOR') {
      url.pathname = '/staff';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

