import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/signup
 * Register a new user with email + password.
 * - Validates input with Zod
 * - Hashes password with bcrypt (12 salt rounds)
 * - Generates verification token
 * - Sends verification email via Resend
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedFields = signUpSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: validatedFields.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists — return generic error message
    // Security: Do not reveal whether the email is already registered
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Unable to create account. Please try a different email." },
        { status: 400 }
      );
    }

    // Hash password with bcrypt — 12 salt rounds
    // bcrypt auto-generates a unique salt per hash, protecting against rainbow tables
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
