"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export default function SignIn({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          sent
            ? { action: "verify", email, token: code }
            : { action: "send", email },
        ),
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      if (sent) router.push("/app");
      else setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection unavailable. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="sign-in-form" onSubmit={submit}>
      <h1>{sent ? "Check your email" : "Welcome back"}</h1>
      <p>
        {sent
          ? "Enter the sign-in code we emailed you."
          : "Your coaching updates, in one place. Sign in with an emailed code."}
      </p>
      <label>
        Email address
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          disabled={sent}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      {sent && (
        <label>
          Sign-in code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,10}"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
      )}
      {!enabled && (
        <p className="notice">
          Sign-in is awaiting provider configuration. You can explore the
          clearly labelled demonstration meanwhile.
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="button primary" disabled={busy || !enabled}>
        {busy ? "Please wait" : sent ? "Sign in" : "Send sign-in code"}
      </button>
      {sent && (
        <button
          type="button"
          className="text-button"
          onClick={() => setSent(false)}
        >
          Use a different email or request a new code
        </button>
      )}
    </form>
  );
}
