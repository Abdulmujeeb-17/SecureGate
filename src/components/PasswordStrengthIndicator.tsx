"use client";

import { useState } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * Password strength indicator component.
 * Evaluates password based on:
 * - Length (8+ characters)
 * - Lowercase letters
 * - Uppercase letters
 * - Numbers
 * - Special characters
 *
 * Displays a visual bar with color coding:
 * - Weak (red): 0-2 criteria met
 * - Fair (yellow): 3 criteria met
 * - Strong (green): 4-5 criteria met
 */
export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);

  const getLabel = () => {
    if (password.length === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    return "Strong";
  };

  const getColor = () => {
    if (strength <= 2) return "#ef4444"; // red
    if (strength <= 3) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  const getWidth = () => {
    if (password.length === 0) return "0%";
    return `${(strength / 5) * 100}%`;
  };

  if (password.length === 0) return null;

  return (
    <div className="password-strength">
      <div className="password-strength-bar">
        <div
          className="password-strength-fill"
          style={{
            width: getWidth(),
            backgroundColor: getColor(),
          }}
        />
      </div>
      <span
        className="password-strength-label"
        style={{ color: getColor() }}
      >
        {getLabel()}
      </span>
    </div>
  );
}
