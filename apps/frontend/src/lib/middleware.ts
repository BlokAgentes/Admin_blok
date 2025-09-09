import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './auth'

export async function authMiddleware(request: NextRequest) {
  const token = extractTokenFromHeader(request.headers.get('authorization') || undefined)
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Add user info to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request)
    
    if (authResult.status !== 200) {
      return authResult
    }

    return handler(request)
  }
} 