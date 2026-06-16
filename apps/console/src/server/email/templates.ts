import type { EmailMessage } from "./mailer"

// Plain, in voice email templates. No em dashes, no emojis, no jargon.

const wrapper = (heading: string, body: string, action: { label: string; url: string }) => `
  <div style="font-family: -apple-system, system-ui, sans-serif; color: #0a0a0a; line-height: 1.6;">
    <h1 style="font-size: 18px; font-weight: 600;">${heading}</h1>
    <p style="color: #5c5c5c;">${body}</p>
    <p>
      <a href="${action.url}" style="display: inline-block; background: #0a0a0a; color: #ffffff; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 500;">
        ${action.label}
      </a>
    </p>
    <p style="color: #8a8a8a; font-size: 13px;">If the button does not work, paste this link into your browser:<br />${action.url}</p>
  </div>
`

export function passwordResetEmail(resetUrl: string): EmailMessage {
  return {
    to: "",
    subject: "Reset your Beckon password",
    html: wrapper(
      "Reset your password",
      "We received a request to reset your password. This link expires in one hour. If you did not ask for this, you can ignore this email.",
      { label: "Reset password", url: resetUrl },
    ),
    text: `Reset your Beckon password. This link expires in one hour:\n${resetUrl}\n\nIf you did not ask for this, ignore this email.`,
  }
}

export function invitationEmail(orgName: string, acceptUrl: string): EmailMessage {
  return {
    to: "",
    subject: `You are invited to join ${orgName} on Beckon`,
    html: wrapper(
      `Join ${orgName}`,
      `You have been invited to join ${orgName} on Beckon. This invite expires in seven days.`,
      { label: "Accept invite", url: acceptUrl },
    ),
    text: `You have been invited to join ${orgName} on Beckon. This invite expires in seven days:\n${acceptUrl}`,
  }
}
