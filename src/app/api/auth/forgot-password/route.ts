import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit, FORGOT_PASSWORD_RATE_LIMIT } from "@/lib/rate-limit";
import { headers } from "next/headers";

/**
 * POST /api/auth/forgot-password
 * Request a password reset email.
 *
 * Security: Always returns success message regardless of whether the email exists.
 * This prevents email enumeration attacks (Postel's Law + Security by Design).
 */
export async function POST(request: Request) {
  try {
    // Rate limiting — prevent abuse
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const rateLimitResult = rateLimit(ip, FORGOT_PASSWORD_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedFields = forgotPasswordSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    // Look up user — but ALWAYS return success (no email enumeration)
    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      // Only send email if user exists
      const resetToken = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, resetToken.token);
    }

    // Always return the same success message
    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we have sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
