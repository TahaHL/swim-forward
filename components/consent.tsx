"use client";
import Link from "next/link";
import { useState } from "react";
export default function Consent({ onSaved }: { onSaved: () => void }) {
  const [accepted, setAccepted] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="form-section">
      <h1>Before you continue</h1>
      <p>
        Read how the programme uses your information. The current notice is a
        template awaiting legal review; this environment is for testing only.
      </p>
      <Link href="/privacy">Read the privacy notice template</Link>
      <label className="consent-check">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        I have read this notice and agree to proceed with fictional test data.
      </label>
      <button
        className="button primary"
        disabled={!accepted}
        onClick={async () => {
          const r = await fetch("/api/account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "consent",
              version: "template-2026-10",
            }),
          });
          if (r.ok) onSaved();
          else setError("Your choice could not be saved. Try again.");
        }}
      >
        Continue
      </button>
      <p role="alert">{error}</p>
    </section>
  );
}
