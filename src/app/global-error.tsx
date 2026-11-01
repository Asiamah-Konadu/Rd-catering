'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main style={{ padding: '60px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>Our system hit an unexpected error. Please try again.</p>
          <button
            style={{ padding: '10px 24px', background: '#d4450c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700 }}
            onClick={() => reset()}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
