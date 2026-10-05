import 'server-only'
import { Resend } from 'resend'
import { env } from '@/lib/env'

let cliente: Resend | null = null
function resend(): Resend {
  if (!cliente) cliente = new Resend(env.resendApiKey)
  return cliente
}

function htmlDoLink(email: string, link: string): string {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f5f5f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#18181b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:20px">Entrar no TryMants</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#3f3f46">
            Você pediu para entrar como <strong>${email}</strong>.
            Clique no botão abaixo para acessar sua conta.
          </p>
          <a href="${link}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;font-weight:500">
            Entrar no TryMants
          </a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#71717a">
            O link vale por 15 minutos e só pode ser usado uma vez.
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#a1a1aa;word-break:break-all">
            Se o botão não funcionar, copie este endereço:<br>${link}
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#71717a">
            Se você não pediu este acesso, pode ignorar este e-mail.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function enviarMagicLink(
  email: string,
  token: string,
): Promise<void> {
  const link = `${env.appUrl}/api/auth/verificar?token=${token}`

  const { error } = await resend().emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Seu link de acesso ao TryMants',
    html: htmlDoLink(email, link),
  })

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`)
  }
}
