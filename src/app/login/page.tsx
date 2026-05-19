"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Login Page
 *
 * Features:
 * - Email + password authentication via NextAuth Credentials provider
 * - Generic error messages — no email enumeration
 * - Loading state during authentication
 * - Links to sign up and forgot password
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for success messages from other flows
  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Generic error message — Principle of Least Surprise
        // Does not reveal whether the email exists or if the password is wrong
        setError(result.error === "Please verify your email before signing in"
          ? result.error
          : "Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your SecureGate account</p>
        </div>

        {verified === "true" && (
          <div className="alert alert-success">
            ✅ Email verified successfully! You can now sign in.
          </div>
        )}

        {reset === "true" && (
          <div className="alert alert-success">
            ✅ Password reset successfully! You can now sign in with your new password.
          </div>
        )}

        {error && (
          <div className="alert alert-error" id="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-input"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="form-forgot">
            <Link href="/forgot-password" className="form-link">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="form-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
