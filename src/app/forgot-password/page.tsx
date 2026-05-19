"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Forgot Password Page
 *
 * Security: Always shows a generic success message regardless of whether
 * the email exists in the database. This prevents email enumeration attacks.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error);
      } else if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(data.message);
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
          <div className="auth-logo">🔑</div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="alert alert-error" id="forgot-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" id="forgot-success">
            {success}
          </div>
        )}

        {!success && (
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="forgot-submit"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Sending...
                </span>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link href="/login" className="form-link">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
