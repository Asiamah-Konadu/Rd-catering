"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page narrow">
      <div className="empty">
        <h1>We&apos;re having trouble loading this page</h1>
        <p>Our kitchen system is temporarily unavailable. Please try again in a moment.</p>
        <button className="button primary" type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}