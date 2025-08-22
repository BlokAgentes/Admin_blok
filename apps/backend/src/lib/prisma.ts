import { PrismaClient } from '@prisma/client'
import { mockPrisma, enableMockMode } from './mock-db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use mock database if enabled or if PostgreSQL connection fails
let prismaClient: any

if (enableMockMode) {
  console.log('🔧 Using mock database for development')
  prismaClient = mockPrisma
} else {
  try {
    prismaClient = globalForPrisma.prisma ?? new PrismaClient()
    
    // Test connection
    prismaClient.$connect().catch(() => {
      console.warn('⚠️  PostgreSQL not available, falling back to mock database')
      prismaClient = mockPrisma
    })
  } catch (error) {
    console.warn('⚠️  Failed to connect to PostgreSQL, using mock database')
    prismaClient = mockPrisma
  }
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}