"use client";

import { useState } from "react";

export default function ResendVerificationButton() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleResend = async () => {
    if (!showInput) {
      setShowInput(true);
      return;
    }
    if (!email) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resend-verification">
      {showInput && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="form-input"
          disabled={loading}
        />
      )}
      <button
        onClick={handleResend}
        className="btn btn-primary"
        disabled={loading}
        id="resend-verification"
      >
        {loading ? "Sending..." : "Resend verification email"}
      </button>
      {message && <p className="resend-message">{message}</p>}
    </div>
  );
}
