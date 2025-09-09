import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'CLIENT'
  // For impersonation:
  originalUserId?: string  // ID of the original admin
  isImpersonating?: boolean
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const extractTokenFromHeader = (authorization: string | undefined): string | null => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }
  return authorization.substring(7)
}

// Impersonation utilities
export const generateImpersonationToken = (
  adminUser: { id: string; email: string; role: 'ADMIN' },
  clientUser: { id: string; email: string; role: 'CLIENT' }
): string => {
  const payload: JWTPayload = {
    userId: clientUser.id,
    email: clientUser.email,
    role: clientUser.role,
    originalUserId: adminUser.id,
    isImpersonating: true
  }
  return generateToken(payload)
}

export const generateStopImpersonationToken = (
  originalAdminUser: { id: string; email: string; role: 'ADMIN' }
): string => {
  const payload: JWTPayload = {
    userId: originalAdminUser.id,
    email: originalAdminUser.email,
    role: originalAdminUser.role,
    // No impersonation fields
  }
  return generateToken(payload)
}

export const isImpersonating = (payload: JWTPayload): boolean => {
  return Boolean(payload.isImpersonating && payload.originalUserId)
}