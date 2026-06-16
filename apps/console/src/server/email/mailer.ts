import { Resend } from "resend"

// Transactional email through Resend. With no RESEND_API_KEY it logs the message
// and does nothing destructive, so everything still runs offline. With a key it
// sends for real. This mirrors the stub pattern used by the model providers.

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? "Beckon <noreply@localhost>"

export interface EmailMessage {
  to: string
  subject: string
  html: string
  text: string
}

export function isEmailConfigured(): boolean {
  return Boolean(apiKey)
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!apiKey) {
    console.log(`[email stub] to=${message.to} subject="${message.subject}"`)
    console.log(message.text)
    return
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })
  if (error) throw new Error(error.message)
}
