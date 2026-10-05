/**
 * Formatação pt-BR. Dinheiro é guardado em centavos (inteiro) e formatado
 * em um único lugar — R$ 800,00 vem de 80000, nunca de 800 * 1.0.
 */
const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatarMoeda(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return '—'
  return BRL.format(cents / 100)
}

export function centavosParaDecimal(valor: string): number | null {
  const limpo = valor.trim()
  if (!limpo) return null
  // Aceita "800", "800,50", "1.200,00" — o que um brasileiro digita.
  const normalizado = limpo.replace(/\./g, '').replace(',', '.')
  const numero = Number(normalizado)
  if (!Number.isFinite(numero) || numero < 0) return null
  return Math.round(numero * 100)
}

export function formatarData(date: Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatarDataCurta(date: Date | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

const DIAS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]

export function diasAte(date: Date): number {
  const hoje = new Date()
  const a = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const b = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.round((b - a) / 86_400_000)
}

export function prazoEmTexto(date: Date | null | undefined): string {
  if (!date) return 'sem prazo'
  const dias = diasAte(date)
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  if (dias < 0) return `${Math.abs(dias)} dia(s) em atraso`
  return `faltam ${dias} dia(s)`
}

export function nomeDoDia(date: Date): string {
  return DIAS[date.getUTCDay()]
}

/** Converte "20/10/2026" (input date) em Date de meia-noite UTC. */
export function dataDeInput(value: string): Date | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
}

/** Formata um Date UTC como "YYYY-MM-DD" para o input type="date". */
export function inputDeData(date: Date | null | undefined): string {
  if (!date) return ''
  return date.toISOString().slice(0, 10)
}
