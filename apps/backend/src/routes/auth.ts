import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateImpersonationToken,
  generateStopImpersonationToken
} from '../lib/auth'
import { requireAuth, requireRole, requireOriginalAdmin, AuthenticatedRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { loginSchema, registerSchema, impersonateSchema } from '../schemas/auth'

const router = Router()

// Login para clientes
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      })
    }

    // Verificar senha
    const isValidPassword = await comparePassword(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      })
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'CLIENT'
    })

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        resource: 'USER',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user.id
      }
    })

    return res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
})

// Login específico para admins
router.post('/admin/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuário admin
    const user = await prisma.user.findUnique({
      where: { email, role: 'ADMIN' }
    })

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais de administrador inválidas'
      })
    }

    // Verificar senha
    const isValidPassword = await comparePassword(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais de administrador inválidas'
      })
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN'
    })

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_LOGIN',
        resource: 'USER',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user.id
      }
    })

    return res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
})

// Registro de novos usuários
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { email, name, password, role } = req.body

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'Email já está em uso'
      })
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as 'ADMIN' | 'CLIENT'
      }
    })

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'CLIENT'
    })

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        action: 'REGISTER',
        resource: 'USER',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        userId: user.id
      }
    })

    return res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
})

// Impersonation - Admin logar como cliente
router.post('/admin/impersonate', 
  requireAuth,
  requireOriginalAdmin,
  validateBody(impersonateSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { clientEmail } = req.body
      
      // Buscar cliente
      const client = await prisma.user.findUnique({
        where: { email: clientEmail, role: 'CLIENT' }
      })

      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        })
      }

      // Buscar dados do admin original
      const admin = await prisma.user.findUnique({
        where: { id: req.user!.userId }
      })

      if (!admin) {
        return res.status(404).json({
          error: 'Administrador não encontrado'
        })
      }

      // Gerar token de impersonation
      const token = generateImpersonationToken(
        { id: admin.id, email: admin.email, role: 'ADMIN' },
        { id: client.id, email: client.email, role: 'CLIENT' }
      )

      // Remover senhas do retorno
      const { password: _clientPass, ...clientWithoutPassword } = client
      const { password: _adminPass, ...adminWithoutPassword } = admin

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          action: 'IMPERSONATE_START',
          resource: 'USER',
          resourceId: client.id,
          details: { 
            adminId: admin.id,
            adminEmail: admin.email,
            clientId: client.id,
            clientEmail: client.email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          userId: admin.id
        }
      })

      return res.json({
        user: clientWithoutPassword,
        token,
        isImpersonating: true,
        originalUser: adminWithoutPassword
      })
    } catch (error) {
      console.error('Impersonation error:', error)
      return res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }
)

// Parar impersonation - Voltar para conta admin
router.post('/admin/stop-impersonation',
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.isImpersonating || !req.user?.originalUserId) {
        return res.status(400).json({
          error: 'Não há sessão de impersonation ativa'
        })
      }

      // Buscar dados do admin original
      const admin = await prisma.user.findUnique({
        where: { id: req.user.originalUserId }
      })

      if (!admin) {
        return res.status(404).json({
          error: 'Administrador original não encontrado'
        })
      }

      // Gerar token normal do admin
      const token = generateStopImpersonationToken({
        id: admin.id,
        email: admin.email,
        role: 'ADMIN'
      })

      // Remover senha do retorno
      const { password: _, ...adminWithoutPassword } = admin

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          action: 'IMPERSONATE_STOP',
          resource: 'USER',
          resourceId: req.user.userId,
          details: { 
            adminId: admin.id,
            adminEmail: admin.email,
            clientId: req.user.userId,
            clientEmail: req.user.email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          userId: admin.id
        }
      })

      return res.json({
        user: adminWithoutPassword,
        token,
        isImpersonating: false
      })
    } catch (error) {
      console.error('Stop impersonation error:', error)
      return res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }
)

// Verificar usuário logado
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      })
    }

    // Se estiver impersonando, incluir dados do admin original
    let originalUser = null
    if (req.user?.isImpersonating && req.user?.originalUserId) {
      originalUser = await prisma.user.findUnique({
        where: { id: req.user.originalUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    return res.json({
      user,
      isImpersonating: req.user?.isImpersonating || false,
      originalUser
    })
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor'
    })
  }
})

// Listar clientes (para admins escolherem quem impersonar)
router.get('/admin/clients',
  requireAuth,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = req.query.search as string || ''

      const skip = (page - 1) * limit

      const where = {
        role: 'CLIENT' as const,
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } }
          ]
        })
      }

      const [clients, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ])

      return res.json({
        clients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      console.error('Get clients error:', error)
      return res.status(500).json({
        error: 'Erro interno do servidor'
      })
    }
  }
)

export default router