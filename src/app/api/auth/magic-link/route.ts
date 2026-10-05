import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { enviarMagicLink } from '@/lib/auth/email'
import {
  gerarToken,
  hashearToken,
  JANELA_MS,
  MAX_PEDIDOS_POR_JANELA,
  TOKEN_TTL_MS,
} from '@/lib/auth/token'

export const runtime = 'nodejs'

const corpo = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(254),
})

/**
 * Resposta idêntica exista ou não a conta: responder diferente confirmaria
 * para um terceiro quais e-mails estão cadastrados.
 */
const RESPOSTA_NEUTRA = {
  mensagem:
    'Se o e-mail estiver cadastrado, você recebe um link de acesso em instantes.',
}

export async function POST(request: Request) {
  const parsed = corpo.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { mensagem: 'Informe um e-mail válido.', erro: true },
      { status: 400 },
    )
  }

  const email = parsed.data.email

  // Freada de abuso: no máximo N pedidos por e-mail na janela.
  const recentes = await db.loginToken.count({
    where: { email, createdAt: { gte: new Date(Date.now() - JANELA_MS) } },
  })

  if (recentes >= MAX_PEDIDOS_POR_JANELA) {
    return NextResponse.json({ ...RESPOSTA_NEUTRA, excedeu: true }, { status: 429 })
  }

  const token = gerarToken()
  const user = await db.user.findUnique({ where: { email } })

  await db.loginToken.create({
    data: {
      email,
      tokenHash: hashearToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      userId: user?.id,
    },
  })

  // Em produção a falha fica oculta atrás da resposta neutra; em desenvolvimento
  // mostramos a causa para não perdermos tempo debugando no escuro.
  try {
    await enviarMagicLink(email, token)
  } catch (erro) {
    console.error('[magic-link] falha no envio:', erro)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { mensagem: `Erro no envio: ${(erro as Error).message}`, erro: true },
        { status: 502 },
      )
    }
  }

  return NextResponse.json(RESPOSTA_NEUTRA)
}
