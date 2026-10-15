"use client";
import { useState, type FormEvent } from "react";
export default function AccountLink({
  demo,
  onSaved,
}: {
  demo: boolean;
  onSaved: () => void;
}) {
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      setNotice("Demonstration only — no child linked.");
      return;
    }
    setBusy(true);
    try {
      const token = new FormData(e.currentTarget).get("token");
      const r = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", token }),
      });
      const body = await r.json();
      if (!r.ok) throw Error(body.error);
      setNotice("Child linked");
      onSaved();
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Could not connect. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form-section" onSubmit={submit}>
      <h2>Link your child</h2>
      <p>
        Enter the invitation code from your coach. Sign in using the email
        address they invited.
      </p>
      <label>
        Invitation code
        <input
          name="token"
          required
          pattern="[a-f0-9]{64}"
          autoComplete="off"
        />
      </label>
      <button className="button primary" disabled={busy}>
        Link child
      </button>
      <p role="status">{notice}</p>
    </form>
  );
}
