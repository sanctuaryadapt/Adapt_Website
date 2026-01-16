import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'



export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Check if the path starts with /admin or /api/admin
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        // Check if we are in development environment or on localhost
        const isDev = process.env.NODE_ENV === 'development'
        const host = request.headers.get('host') || ''
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

        // If not dev and not localhost, block access
        if (!isDev && !isLocalhost) {
            return new NextResponse('Not Found', { status: 404 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*'
    ],
}
