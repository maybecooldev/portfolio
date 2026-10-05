import 'server-only'

/**
 * Validação de ambiente. Falhar aqui, no boot, é muito melhor do que
 * falhar no meio de uma requisição com um erro de conexão do Postgres.
 */
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `A variável de ambiente ${name} não está definida. ` +
        `Copie .env.example para .env.local e preencha.`,
    )
  }
  return value
}

export const env = {
  get databaseUrl() {
    return required('DATABASE_URL')
  },
  get resendApiKey() {
    return required('RESEND_API_KEY')
  },
  get emailFrom() {
    return required('EMAIL_FROM')
  },
  get appUrl() {
    return process.env.APP_URL ?? 'http://localhost:3000'
  },
}
