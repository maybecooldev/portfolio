import { z } from 'zod'

const texto = (campo: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${campo} é obrigatório.`)
    .max(max, `${campo} deve ter no máximo ${max} caracteres.`)

export const clienteSchema = z.object({
  name: texto('O nome', 120),
  email: z
    .union([z.literal(''), z.string().trim().email('E-mail inválido.')])
    .optional()
    .transform((v) => (v ? v : null)),
  phone: z.string().trim().max(40).optional().transform((v) => v || null),
  company: z.string().trim().max(120).optional().transform((v) => v || null),
  notes: z.string().trim().max(4000).optional().transform((v) => v || null),
})

export const projetoSchema = z.object({
  clientId: texto('Selecione um cliente', 64),
  title: texto('O título', 160),
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => v || null),
  status: z.enum(
    ['PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO'],
    { message: 'Status inválido.' },
  ),
  // Vem do input como texto ("800", "1.200,50"); converte em centavos.
  value: z
    .string()
    .trim()
    .optional()
    .transform((v) => centavosDeTexto(v)),
  // Vem do input type="date": "YYYY-MM-DD".
  dueDate: z
    .string()
    .trim()
    .optional()
    .transform((v) => dataDeTexto(v)),
})

export const tarefaSchema = z.object({
  title: texto('O título', 200),
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => v || null),
})

function centavosDeTexto(valor: string | undefined): number | null {
  if (!valor) return null
  const normalizado = valor.replace(/\./g, '').replace(',', '.')
  const numero = Number(normalizado)
  if (!Number.isFinite(numero) || numero < 0) return null
  return Math.round(numero * 100)
}

function dataDeTexto(valor: string | undefined): Date | null {
  if (!valor) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
}

export type ClienteInput = z.infer<typeof clienteSchema>
export type ProjetoInput = z.infer<typeof projetoSchema>
export type TarefaInput = z.infer<typeof tarefaSchema>

/** Transforma os erros do Zod em algo apresentável em português. */
export function errosDoZod(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {}
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? 'formulario')
    if (!saida[campo]) saida[campo] = issue.message
  }
  return saida
}
