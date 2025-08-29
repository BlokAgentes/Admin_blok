// Mock database for development and testing
// This simulates database operations without requiring a real database

interface MockUser {
  id: string
  email: string
  name: string
  password: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: Date
  updatedAt: Date
}

interface MockAuditLog {
  id: string
  action: string
  resource: string
  resourceId?: string
  details?: any
  ipAddress?: string
  userAgent?: string
  userId: string
  createdAt: Date
}

// In-memory data store
let mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@blok.com',
    name: 'Admin Principal',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // senha: admin123
    role: 'ADMIN',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: '2',
    email: 'joao@cliente.com',
    name: 'João Silva',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // senha: cliente123
    role: 'CLIENT',
    createdAt: new Date('2024-01-02T14:30:00Z'),
    updatedAt: new Date('2024-01-02T14:30:00Z')
  },
  {
    id: '3',
    email: 'maria@cliente.com',
    name: 'Maria Santos',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // senha: cliente123
    role: 'CLIENT',
    createdAt: new Date('2024-01-03T09:15:00Z'),
    updatedAt: new Date('2024-01-03T09:15:00Z')
  },
  {
    id: '4',
    email: 'pedro@cliente.com',
    name: 'Pedro Oliveira',
    password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oXx0zEqvW', // senha: cliente123
    role: 'CLIENT',
    createdAt: new Date('2024-01-04T16:45:00Z'),
    updatedAt: new Date('2024-01-04T16:45:00Z')
  }
]

let mockAuditLogs: MockAuditLog[] = []

// Mock database client
export const mockDB = {
  user: {
    findUnique: async ({ where }: { where: any }) => {
      if (where.email) {
        return mockUsers.find(user => user.email === where.email) || null
      }
      if (where.id) {
        return mockUsers.find(user => user.id === where.id) || null
      }
      if (where.email && where.role) {
        return mockUsers.find(user => user.email === where.email && user.role === where.role) || null
      }
      return null
    },

    findMany: async ({ where, select, skip = 0, take = 10, orderBy }: any = {}) => {
      let filteredUsers = [...mockUsers]

      // Apply filters
      if (where) {
        if (where.role) {
          filteredUsers = filteredUsers.filter(user => user.role === where.role)
        }
        if (where.OR) {
          filteredUsers = filteredUsers.filter(user => 
            where.OR.some((condition: any) => {
              if (condition.email?.contains) {
                return user.email.toLowerCase().includes(condition.email.contains.toLowerCase())
              }
              if (condition.name?.contains) {
                return user.name.toLowerCase().includes(condition.name.contains.toLowerCase())
              }
              return false
            })
          )
        }
      }

      // Apply ordering
      if (orderBy?.createdAt === 'desc') {
        filteredUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      // Apply pagination
      const paginatedUsers = filteredUsers.slice(skip, skip + take)

      // Apply selection
      if (select) {
        return paginatedUsers.map(user => {
          const selectedUser: any = {}
          Object.keys(select).forEach(key => {
            if (select[key] && key in user) {
              selectedUser[key] = (user as any)[key]
            }
          })
          return selectedUser
        })
      }

      return paginatedUsers.map(user => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      })
    },

    count: async ({ where }: { where?: any } = {}) => {
      let filteredUsers = [...mockUsers]
      
      if (where) {
        if (where.role) {
          filteredUsers = filteredUsers.filter(user => user.role === where.role)
        }
        if (where.OR) {
          filteredUsers = filteredUsers.filter(user => 
            where.OR.some((condition: any) => {
              if (condition.email?.contains) {
                return user.email.toLowerCase().includes(condition.email.contains.toLowerCase())
              }
              if (condition.name?.contains) {
                return user.name.toLowerCase().includes(condition.name.contains.toLowerCase())
              }
              return false
            })
          )
        }
      }

      return filteredUsers.length
    },

    create: async ({ data }: { data: any }) => {
      const newUser: MockUser = {
        id: (mockUsers.length + 1).toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockUsers.push(newUser)
      const { password, ...userWithoutPassword } = newUser
      return userWithoutPassword
    }
  },

  auditLog: {
    create: async ({ data }: { data: any }) => {
      const newLog: MockAuditLog = {
        id: (mockAuditLogs.length + 1).toString(),
        ...data,
        createdAt: new Date()
      }
      mockAuditLogs.push(newLog)
      console.log('📝 Audit Log:', newLog.action, newLog.details)
      return newLog
    }
  }
}

export const enableMockMode = process.env.USE_MOCK_DB === 'true'