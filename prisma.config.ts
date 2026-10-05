import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// .env.local primeiro (as credenciais reais); .env só completa o que faltar.
// `dotenv/config` sozinho não lê .env.local, então carregamos explicitamente.
config({ path: '.env.local' })
config()

/**
 * No Prisma 7 a URL de conexão saiu do schema e passou para cá.
 * `DIRECT_URL` (endpoint sem "-pooler") é usada pelo Migrate quando existe,
 * porque migração precisa de conexão direta e a pooler do Neon não serve.
 */
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!url) {
  throw new Error(
    'DATABASE_URL não definida. Copie .env.example para .env.local e preencha.',
  )
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: { url },
})
