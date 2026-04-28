import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth & quota enforcement is handled inside each API route handler.
 * See: /api/analyze/route.ts
 *
 * This middleware is intentionally a no-op to satisfy the Cloudflare
 * Edge-only requirement from @opennextjs/cloudflare.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Empty matcher = no routes intercepted.
  // Auth is enforced directly in the API route handlers.
  matcher: [],
}
