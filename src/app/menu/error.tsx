'use client';

export default function MenuError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page narrow"><div className="empty"><h1>We couldn&apos;t load the menu</h1><p>Please try again in a moment.</p><button className="button primary" type="button" onClick={() => reset()}>Try again</button></div></main>;
}