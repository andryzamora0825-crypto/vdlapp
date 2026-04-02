// Prisma client instantiation
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    // Keep connections alive so Supabase doesn't drop them after inactivity
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Release idle connections quickly so a fresh one is created on next request
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
  })

  // Log pool errors instead of crashing the process
  pool.on('error', (err) => {
    console.error('[pg pool] Unexpected error on idle client:', err.message)
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
