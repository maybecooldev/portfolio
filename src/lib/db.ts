import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

/**
 * No Prisma 7 a conexão vem de um driver adapter. A URL da .env.local já
 * traz `?schema=trymants`, que é o que mantém o TryMants separado do outro
 * app que divide o database.
 */
function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({ adapter })
}

// Em desenvolvimento o Next recarrega os módulos a cada alteração; sem este
// cache global abriríamos um pool novo a cada hot reload até estourar o
// limite de conexões do Postgres.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
