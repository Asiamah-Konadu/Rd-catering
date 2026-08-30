"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Check your credentials and try again.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.assign("/admin");
        return;
      }

      // Fallback
      setError("Sign-in failed. Please check your email and password.");
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("An unexpected error occurred during sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page narrow">
      <div className="page-heading">
        <span className="eyebrow">RD Catering</span>
        <h1>Admin Sign In</h1>
        <p>Sign in with your staff account to continue.</p>
      </div>

      <form className="checkout" onSubmit={submit} aria-busy={loading}>
        <label htmlFor="admin-email">
          Email
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label htmlFor="admin-password">
          Password
          <input
            id="admin-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className="form-error font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          className="button primary full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
