import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = "SecureGate <onboarding@resend.dev>";

/**
 * Send a verification email with a tokenized link.
 * The link points to /verify-email/[token] which validates and activates the account.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email/${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your SecureGate account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #e4e4e7; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #1e1b2e 100%); border-radius: 16px; padding: 40px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #a78bfa; margin: 0;">🔐 SecureGate</h1>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; color: #fafafa; margin-bottom: 16px;">Verify your email</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              Welcome to SecureGate! Click the button below to verify your email address and activate your account. This link expires in <strong style="color: #e4e4e7;">15 minutes</strong>.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 12px; color: #71717a; line-height: 1.5;">
              If you didn't create a SecureGate account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
            <p style="font-size: 11px; color: #52525b; text-align: center;">
              SecureGate — Secure Authentication System
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

/**
 * Send a password reset email with a tokenized link.
 * The link points to /reset-password/[token]. Expires in 1 hour.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password/${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your SecureGate password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #e4e4e7; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #18181b 0%, #1e1b2e 100%); border-radius: 16px; padding: 40px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #a78bfa; margin: 0;">🔐 SecureGate</h1>
            </div>
            <h2 style="font-size: 20px; font-weight: 600; color: #fafafa; margin-bottom: 16px;">Reset your password</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 24px;">
              We received a request to reset your password. Click the button below to choose a new password. This link expires in <strong style="color: #e4e4e7;">1 hour</strong>.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a78bfa); color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 12px; color: #71717a; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email. Your password will not change.
            </p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
            <p style="font-size: 11px; color: #52525b; text-align: center;">
              SecureGate — Secure Authentication System
            </p>
          </div>
        </body>
      </html>
    `,
  });
}
