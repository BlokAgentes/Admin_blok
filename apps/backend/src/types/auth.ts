export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  role?: 'ADMIN' | 'CLIENT'
}

export interface ImpersonateRequest {
  clientEmail: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
  isImpersonating?: boolean
  originalUser?: Omit<User, 'password'>
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: 'ADMIN' | 'CLIENT'
    originalUserId?: string
    isImpersonating?: boolean
  }
}