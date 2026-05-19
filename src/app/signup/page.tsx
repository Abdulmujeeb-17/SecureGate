"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

/**
 * Sign Up Page
 *
 * Features:
 * - Full form validation (name, email, password, confirm password)
 * - Password strength indicator (weak / fair / strong)
 * - Zod validation on the server (API route)
 * - Client-side validation for instant feedback
 * - Loading state during submission
 * - Success message with instruction to check email
 */
export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateClient = () => {
    const errors: Record<string, string> = {};

    if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one number";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateClient()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(data.message);
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join SecureGate and get started</p>
        </div>

        {error && (
          <div className="alert alert-error" id="signup-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" id="signup-success">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`form-input ${fieldErrors.name ? "form-input-error" : ""}`}
                required
                autoComplete="name"
                disabled={loading}
              />
              {fieldErrors.name && (
                <span className="form-error">{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`form-input ${fieldErrors.email ? "form-input-error" : ""}`}
                required
                autoComplete="email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <span className="form-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`form-input ${fieldErrors.password ? "form-input-error" : ""}`}
                required
                autoComplete="new-password"
                disabled={loading}
              />
              <PasswordStrengthIndicator password={formData.password} />
              {fieldErrors.password && (
                <span className="form-error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`form-input ${fieldErrors.confirmPassword ? "form-input-error" : ""}`}
                required
                autoComplete="new-password"
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <span className="form-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="signup-submit"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="form-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
