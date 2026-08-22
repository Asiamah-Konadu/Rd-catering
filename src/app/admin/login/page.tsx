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
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Sign-in failed. Check your details and try again.");
      setLoading(false);
      return;
    }
    window.location.assign("/admin");
  }

  return <main className="page narrow"><div className="page-heading"><span className="eyebrow">RD Catering</span><h1>Admin sign in</h1><p>Sign in with your staff account to continue.</p></div>
    <form className="checkout" onSubmit={submit} aria-busy={loading}>
      <label htmlFor="admin-email">Email<input id="admin-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label htmlFor="admin-password">Password<input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  </main>;
}
