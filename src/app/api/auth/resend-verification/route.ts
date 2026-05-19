import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { z } from "zod";

export const dynamic = "force-dynamic";

const resendSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

/**
 * POST /api/auth/resend-verification
 * Resend the verification email for an unverified user.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedFields = resendSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { email } = validatedFields.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or is already verified
    if (!user || user.emailVerified) {
      return NextResponse.json({
        success: true,
        message:
          "If an unverified account with that email exists, a new verification link has been sent.",
      });
    }

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json({
      success: true,
      message:
        "If an unverified account with that email exists, a new verification link has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
