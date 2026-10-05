import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { gerarToken, hashearToken, SESSION_TTL_MS } from './token'

export const COOKIE_SESSAO = 'try_session'

export async function criarSessao(userId: string): Promise<string> {
  const token = gerarToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.session.create({
    data: {
      token: hashearToken(token),
      userId,
      expiresAt,
    },
  })

  const jar = await cookies()
  jar.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  return token
}

/** Sessão válida do cookie atual, ou null. Faz o refresh deslizante do TTL. */
export async function obterSessao() {
  const jar = await cookies()
  const token = jar.get(COOKIE_SESSAO)?.value
  if (!token) return null

  const sessao = await db.session.findUnique({
    where: { token: hashearToken(token) },
    include: { user: true },
  })

  if (!sessao) return null

  if (sessao.expiresAt < new Date()) {
    await db.session.delete({ where: { id: sessao.id } })
    return null
  }

  // Renova a expiração se estiver na metade final da vida.
  const restante = sessao.expiresAt.getTime() - Date.now()
  if (restante < SESSION_TTL_MS / 2) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
    await db.session.update({ where: { id: sessao.id }, data: { expiresAt } })
    jar.set(COOKIE_SESSAO, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    })
  }

  return sessao
}

export type UsuarioComSessao = NonNullable<Awaited<ReturnType<typeof obterSessao>>>

/** Porta de entrada de toda página autenticada. */
export async function exigirUsuario(): Promise<UsuarioComSessao> {
  const sessao = await obterSessao()
  if (!sessao) redirect('/entrar')
  return sessao
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(COOKIE_SESSAO)?.value
  if (token) {
    await db.session
      .deleteMany({ where: { token: hashearToken(token) } })
      .catch(() => undefined)
  }
  jar.delete(COOKIE_SESSAO)
}
