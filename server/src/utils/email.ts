import { env } from "../config/env.js";

async function sendEmail(to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY) {
    console.log(`\n📧 [DEV — no RESEND_API_KEY set] Email to ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, "")}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Don't throw — callers (e.g. forgot-password) intentionally return a
    // generic success response regardless of email delivery, both to avoid
    // leaking account existence and so a transient provider issue doesn't
    // surface as a broken-looking error to the user.
    console.error(`Failed to send email to ${to}:`, res.status, body);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your RouteMap password",
    `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Reset your password</h2>
        <p style="color: #444;">Someone requested a password reset for your RouteMap account. If this was you, click below — this link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #4F7CFF; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset password</a>
        </p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      </div>
    `
  );
}
