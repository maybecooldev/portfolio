import { NextResponse } from 'next/server'
import { encerrarSessao } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  await encerrarSessao()
  return NextResponse.redirect(new URL('/entrar', request.url), { status: 303 })
}
