"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

/**
 * Reset Password Page
 *
 * Validates the token from the URL, accepts a new password,
 * hashes it on the server, and redirects to login on success.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        // Redirect to login with success message
        router.push("/login?reset=true");
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
          <div className="auth-logo">🔒</div>
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="alert alert-error" id="reset-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="reset-submit"
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Resetting...
              </span>
            ) : (
              "Reset password"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link href="/login" className="form-link">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
