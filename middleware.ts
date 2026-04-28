import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only enforce on Analysis API
  if (pathname.startsWith('/api/analyze')) {

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Build an Edge-compatible Supabase client using request cookies (NOT next/headers)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ── ADMIN BYPASS: Skip quota header injection for site owner ──
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email === adminEmail) {
      return NextResponse.next()
    }

    // Pass user-id to API route via header so it can enforce quota
    response.headers.set('x-user-id', user.id)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
