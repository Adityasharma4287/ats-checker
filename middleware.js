import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('sb-access-token') ||
    request.cookies.get('sb-refresh-token')

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
