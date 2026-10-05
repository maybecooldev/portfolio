import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { criarSessao } from '@/lib/auth/session'
import { hashearToken } from '@/lib/auth/token'

export const runtime = 'nodejs'

/** Verifica o magic link, consome o token e abre a sessão. Uso único. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/entrar?erro=token', request.url))

  const registro = await db.loginToken.findUnique({
    where: { tokenHash: hashearToken(token) },
  })

  const invalido = !registro || registro.usedAt !== null || registro.expiresAt < new Date()

  if (invalido) {
    if (registro?.usedAt) {
      // Um token já usado é sinal de algo suspeito — invalidamos a sessão dele.
      return NextResponse.redirect(new URL('/entrar?erro=usado', request.url))
    }
    return NextResponse.redirect(new URL('/entrar?erro=expirado', request.url))
  }

  // Primeiro login cria a conta; depois é só reuse do usuário existente.
  const user = await db.user.upsert({
    where: { email: registro.email },
    create: { email: registro.email },
    update: {},
  })

  // Consome o token atomicamente: `usedAt: null` na cláusula where garante
  // que duas requisições simultâneas com o mesmo link não criem duas sessões.
  const consumo = await db.loginToken.updateMany({
    where: { id: registro.id, usedAt: null },
    data: { usedAt: new Date() },
  })

  if (consumo.count === 0) {
    return NextResponse.redirect(new URL('/entrar?erro=usado', request.url))
  }

  await criarSessao(user.id)

  return NextResponse.redirect(new URL('/app', request.url))
}
