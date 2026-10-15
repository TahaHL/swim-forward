"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="information-page">
      <h1>This page could not load</h1>
      <p>
        Try again. If the problem continues, contact your programme organiser.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
