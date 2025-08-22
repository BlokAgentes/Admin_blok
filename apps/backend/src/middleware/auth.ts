import { Request, Response, NextFunction } from 'express'
import { verifyToken, extractTokenFromHeader } from '../lib/auth'
import { prisma } from '../lib/prisma'

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: 'ADMIN' | 'CLIENT'
    originalUserId?: string
    isImpersonating?: boolean
  }
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization)
    
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso é obrigatório'
      })
    }

    const payload = verifyToken(token)
    
    if (!payload) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      })
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      })
    }

    // If impersonating, verify original admin still exists
    if (payload.isImpersonating && payload.originalUserId) {
      const originalAdmin = await prisma.user.findUnique({
        where: { id: payload.originalUserId }
      })

      if (!originalAdmin || originalAdmin.role !== 'ADMIN') {
        return res.status(401).json({
          error: 'Sessão de impersonation inválida'
        })
      }
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      originalUserId: payload.originalUserId,
      isImpersonating: payload.isImpersonating
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
}

export const requireRole = (allowedRoles: ('ADMIN' | 'CLIENT')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado para este tipo de usuário'
      })
    }

    next()
  }
}

export const requireOriginalAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Usuário não autenticado'
    })
  }

  if (req.user.role !== 'ADMIN' || req.user.isImpersonating) {
    return res.status(403).json({
      error: 'Acesso restrito a administradores originais'
    })
  }

  next()
}