"use client";

import { useActionState } from "react";
import { authenticateAdmin } from "./actions";

export default function AdminLoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticateAdmin,
    undefined
  );

  return (
    <main className="page narrow">
      <div className="page-heading">
        <span className="eyebrow">Rich-Dons Catering</span>
        <h1>Admin Sign In</h1>
        <p>Sign in with your staff account to continue.</p>
      </div>

      <form action={dispatch} className="checkout" aria-busy={isPending}>
        <label htmlFor="admin-email">
          Email
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </label>

        <label htmlFor="admin-password">
          Password
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>

        {errorMessage && (
          <p
            className="form-error font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg text-sm"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <button
          className="button primary full"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
