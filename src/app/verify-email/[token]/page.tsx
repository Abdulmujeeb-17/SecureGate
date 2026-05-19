import { db } from "@/lib/db";
import Link from "next/link";
import ResendVerificationButton from "./ResendButton";

export const dynamic = "force-dynamic";

/**
 * Email Verification Page (Server Component)
 *
 * Handles the /verify-email/[token] route:
 * - Looks up the token in the database
 * - Checks if the token has expired
 * - Marks the user as verified (emailVerified = current timestamp)
 * - Deletes the used token to prevent reuse
 * - Shows appropriate success/error messages
 */

interface VerifyEmailPageProps {
  params: { token: string };
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { token } = params;

  // Look up the verification token
  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  // Token not found
  if (!verificationToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">❌</div>
            <h1 className="auth-title">Invalid verification link</h1>
            <p className="auth-subtitle">
              This verification link is invalid or has already been used.
            </p>
          </div>
          <div className="verify-actions">
            <ResendVerificationButton />
            <Link href="/login" className="btn btn-secondary">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Token expired
  if (new Date() > verificationToken.expires) {
    // Clean up expired token
    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">⏰</div>
            <h1 className="auth-title">Link expired</h1>
            <p className="auth-subtitle">
              This verification link has expired. Please request a new one.
            </p>
          </div>
          <div className="verify-actions">
            <ResendVerificationButton />
            <Link href="/login" className="btn btn-secondary">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Token is valid — verify the user
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await db.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✅</div>
          <h1 className="auth-title">Email verified!</h1>
          <p className="auth-subtitle">
            Your email has been verified successfully. You can now sign in to your account.
          </p>
        </div>
        <div className="verify-actions">
          <Link href="/login?verified=true" className="btn btn-primary">
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
