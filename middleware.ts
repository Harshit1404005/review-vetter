import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { createServerClient } from '@supabase/ssr'
import { QuotaManager } from '@/lib/quota'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Only enforce on Analysis API
  if (pathname.startsWith('/api/analyze')) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

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

    // 2. Enforce Quota
    const quota = await QuotaManager.checkAndIncrement(user.id)
    
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.error || 'Daily usage limit reached' },
        { status: 402 }
      )
    }

    // 3. Inject remaining quota into headers for frontend usage (optional optimization)
    response.headers.set('x-quota-remaining', quota.remaining.toString())
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/analyze', '/api/analyze-raw'],
}
