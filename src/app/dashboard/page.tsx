"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <span className="spinner spinner-lg" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-brand">
          <span className="auth-logo-sm">🔐</span>
          <span className="dashboard-nav-title">SecureGate</span>
        </div>
        <button onClick={handleLogout} className="btn btn-logout" id="logout-btn">
          Sign out
        </button>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <div className="dashboard-avatar">
            {session.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className="dashboard-title">
            Welcome, {session.user?.name || "User"}!
          </h1>
          <p className="dashboard-subtitle">
            You are authenticated and verified. This is your protected dashboard.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">👤</div>
            <h3>Profile</h3>
            <div className="dashboard-card-info">
              <p><strong>Name:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🛡️</div>
            <h3>Security Status</h3>
            <div className="dashboard-card-info">
              <p><span className="status-badge status-verified">✓ Email Verified</span></p>
              <p><span className="status-badge status-active">✓ Session Active</span></p>
              <p><span className="status-badge status-secured">✓ Password Hashed</span></p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔑</div>
            <h3>Session Info</h3>
            <div className="dashboard-card-info">
              <p><strong>Strategy:</strong> JWT</p>
              <p><strong>User ID:</strong> {session.user?.id?.slice(0, 12)}...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
