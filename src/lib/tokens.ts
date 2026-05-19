import crypto from "crypto";
import { db } from "@/lib/db";

/**
 * Generate a secure verification token for email verification.
 * Uses crypto.randomBytes(32) for cryptographic security.
 * Token expires in 15 minutes as per spec.
 */
export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing tokens for this email
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

/**
 * Generate a secure password reset token.
 * Token expires in 1 hour as per spec.
 */
export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing reset tokens for this email
  await db.passwordResetToken.deleteMany({
    where: { email },
  });

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
}
