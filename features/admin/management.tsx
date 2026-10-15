"use client";
import { useState, type FormEvent } from "react";
import type { Data } from "@/features/progress/model";
export default function Management({
  data,
  demo,
  onSaved,
}: {
  data: Data;
  demo: boolean;
  onSaved: () => void;
}) {
  const [notice, setNotice] = useState(""),
    [token, setToken] = useState("");
  async function manage(
    action: string,
    id: string,
    values: Record<string, unknown> = {},
  ) {
    if (demo) {
      setNotice("Demonstration only — no records changed.");
      return;
    }
    try {
      const r = await fetch("/api/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, values }),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      setNotice("Saved");
      onSaved();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save. Try again.");
    }
  }
  async function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      setNotice("Demonstration only — no invitation created.");
      return;
    }
    const form = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email: form.get("email"),
          swimmerId: form.get("swimmerId"),
        }),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      setToken(b.token);
      setNotice(
        "Invitation created. Share the code directly with the invited parent. It expires in seven days.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Could not create invitation. Try again.",
      );
    }
  }
  return (
    <>
      <section className="form-section">
        <h2>Teaching library</h2>
        <p>
          Review criteria before approving a skill. Editing criteria returns it
          to review; existing assessments keep their original criteria.
        </p>
        {data.skills.map((s) => (
          <details key={s.id}>
            <summary>
              {s.title} —{" "}
              {s.retired_at
                ? "Retired"
                : s.approved_at
                  ? "Approved"
                  : "Needs review"}
            </summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void manage("edit_skill", s.id, {
                  title: f.get("title"),
                  explanation: f.get("explanation"),
                  criteria: String(f.get("criteria"))
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
              }}
            >
              <label>
                Skill title
                <input name="title" defaultValue={s.title} required />
              </label>
              <label>
                Why it matters
                <textarea name="explanation" defaultValue={s.explanation} />
              </label>
              <label>
                Success criteria, one per line
                <textarea
                  name="criteria"
                  defaultValue={s.criteria.join("\n")}
                  required
                />
              </label>
              <button className="button secondary">Save for review</button>
            </form>
            <button
              className="text-button"
              onClick={() => manage("approve_skill", s.id)}
            >
              Approve criteria
            </button>
            {!s.retired_at && (
              <button
                className="text-button"
                onClick={() => manage("retire_skill", s.id)}
              >
                Retire skill
              </button>
            )}
          </details>
        ))}
      </section>
      <form className="form-section" onSubmit={invite}>
        <h2>Connect a parent</h2>
        <label>
          Swimmer
          <select name="swimmerId" required>
            {data.swimmers.map((s) => (
              <option value={s.id} key={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Parent email
          <input name="email" type="email" required />
        </label>
        <button className="button primary">Create invitation</button>
        {token && (
          <label>
            Single-use invitation code
            <input
              readOnly
              value={token}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
        )}
      </form>
      <p role="status">{notice}</p>
    </>
  );
}
