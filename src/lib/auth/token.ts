import 'server-only'
import { createHash, randomBytes } from 'node:crypto'

/** O token vai por e-mail e volta pela URL, então nunca guardamos o valor cru. */
export function gerarToken(): string {
  return randomBytes(32).toString('hex')
}

/** SHA-256 basta aqui: o token tem entropia de 256 bits, não é senha. */
export function hashearToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutos
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 dias

/** Máximo de pedidos de link por e-mail na janela — freada de abuso. */
export const MAX_PEDIDOS_POR_JANELA = 3
export const JANELA_MS = 15 * 60 * 1000
