"use client";
import { useEffect, useState } from "react";
import { StatusControl } from "@/components/core";
import {
  formatDate,
  formatTime,
  type Data,
  type Status,
} from "@/features/progress/model";
type Draft = {
  note: string;
  focus: string;
  internal: string;
  ratings: Record<
    string,
    { status: Status; observation: string; target: string }
  >;
  requestId: string;
  updated: number;
};
const fresh = (): Draft => ({
  note: "",
  focus: "",
  internal: "",
  ratings: {},
  requestId: crypto.randomUUID(),
  updated: Date.now(),
});
export default function Assessment({
  data,
  demo,
  onSaved,
}: {
  data: Data;
  demo: boolean;
  onSaved: () => void;
}) {
  const [sessionId, setSession] = useState(
    data.sessions.find((s) => !s.cancelled)?.id ?? "",
  );
  const session = data.sessions.find((s) => s.id === sessionId);
  const swimmers = data.swimmers.filter((s) =>
    data.enrolments.some(
      (e) => e.swimmer_id === s.id && e.block_id === session?.block_id,
    ),
  );
  const [selected, setSelected] = useState("");
  const child = swimmers.find((s) => s.id === selected) ?? swimmers[0];
  const [draft, setDraft] = useState<Draft | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [storageError, setStorageError] = useState("");
  const key = `swim-draft:${data.user.id}:${sessionId}:${child?.id ?? ""}`;
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        const saved = raw ? (JSON.parse(raw) as Draft) : null;
        setDraft(
          saved && Date.now() - saved.updated < 86400000 ? saved : fresh(),
        );
      } catch {
        setDraft(fresh());
        setStorageError(
          "This browser cannot restore drafts. Keep this page open until you publish.",
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [key]);
  function handleDraftChange(patch: Partial<Draft>) {
    if (!draft) return;
    const next = { ...draft, ...patch, updated: new Date().getTime() };
    setDraft(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "Draft storage is unavailable. Keep this page open until you publish.",
      );
    }
  }
  async function publish() {
    if (!draft || !child) return;
    setBusy(true);
    setNotice("");
    try {
      if (demo) {
        setNotice("Demonstration only — no records were published.");
        return;
      }
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swimmer: child.id,
          session: sessionId,
          note: draft.note,
          focus: draft.focus,
          internal: draft.internal,
          requestId: draft.requestId,
          ratings: Object.entries(draft.ratings).map(([skill_id, r]) => ({
            skill_id,
            ...r,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      localStorage.removeItem(key);
      setDraft(fresh());
      setNotice("Update published");
      onSaved();
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Connection unavailable. Your draft is still available.",
      );
    } finally {
      setBusy(false);
    }
  }
  const skills = data.skills.filter(
    (s) =>
      s.approved_at &&
      !s.retired_at &&
      data.swimmer_skills.some(
        (x) => x.swimmer_id === child?.id && x.skill_id === s.id,
      ),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="muted">Poolside</p>
          <h1>Every detail, understood.</h1>
        </div>
      </div>
      <div className="assessment-selectors">
        <label>
          Session
          <select
            value={sessionId}
            onChange={(e) => setSession(e.target.value)}
          >
            {data.sessions
              .filter((s) => !s.cancelled)
              .map((s) => (
                <option value={s.id} key={s.id}>
                  Week {s.week} — {formatDate(s.starts_at)},{" "}
                  {formatTime(s.starts_at)}
                </option>
              ))}
          </select>
        </label>
        <label>
          Swimmer
          <select
            value={child?.id ?? ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {swimmers.map((s) => (
              <option value={s.id} key={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!child ? (
        <div className="empty">
          <h2>No swimmers assigned yet</h2>
          <p>
            An administrator needs to assign your block and enrol its swimmers.
          </p>
        </div>
      ) : (
        <>
          <div className="section-heading">
            <h2>{child.first_name}’s assessment</h2>
            <div>
              <button
                className="text-button"
                disabled={swimmers.indexOf(child) === 0}
                onClick={() =>
                  setSelected(swimmers[swimmers.indexOf(child) - 1].id)
                }
              >
                Previous
              </button>
              <button
                className="text-button"
                disabled={swimmers.indexOf(child) === swimmers.length - 1}
                onClick={() =>
                  setSelected(swimmers[swimmers.indexOf(child) + 1].id)
                }
              >
                Next
              </button>
            </div>
          </div>
          <p className="muted small">
            Drafts stay on this device for up to 24 hours. Use a trusted device
            and sign out when finished. Nothing is published until you choose
            Publish update.
          </p>
          {storageError && (
            <p role="alert" className="error">
              {storageError}
            </p>
          )}
          {draft && (
            <>
              <div className="assessment-list">
                {skills.map((skill) => {
                  const rating = draft.ratings[skill.id] ?? {
                    status: null,
                    observation: "",
                    target: "",
                  };
                  const update = (patch: Partial<typeof rating>) =>
                    handleDraftChange({
                      ratings: {
                        ...draft.ratings,
                        [skill.id]: { ...rating, ...patch },
                      },
                    });
                  return (
                    <section className="assessment-row" key={skill.id}>
                      <h3>{skill.title}</h3>
                      <StatusControl
                        label={`${skill.title} rating`}
                        value={rating.status}
                        onChange={(status) => update({ status })}
                      />
                      <details>
                        <summary>Add feedback or a target</summary>
                        <label>
                          Parent-visible observation
                          <textarea
                            value={rating.observation}
                            maxLength={1000}
                            onChange={(e) =>
                              update({ observation: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Next target
                          <textarea
                            value={rating.target}
                            maxLength={500}
                            onChange={(e) => update({ target: e.target.value })}
                          />
                        </label>
                      </details>
                    </section>
                  );
                })}
              </div>
              <section className="form-section">
                <h2>What parents will see</h2>
                <label>
                  How the session went
                  <textarea
                    value={draft.note}
                    maxLength={1500}
                    onChange={(e) =>
                      handleDraftChange({ note: e.target.value })
                    }
                  />
                </label>
                <label>
                  One next focus
                  <textarea
                    value={draft.focus}
                    maxLength={300}
                    onChange={(e) =>
                      handleDraftChange({ focus: e.target.value })
                    }
                  />
                </label>
                <details>
                  <summary>
                    Internal teacher note — never shown to parents
                  </summary>
                  <label>
                    Private note
                    <textarea
                      value={draft.internal}
                      maxLength={2000}
                      onChange={(e) =>
                        handleDraftChange({ internal: e.target.value })
                      }
                    />
                  </label>
                </details>
              </section>
              <div className="publish-bar">
                <span role="status">{notice || "Draft only"}</span>
                <button
                  className="button primary"
                  disabled={busy || !draft.note.trim() || !draft.focus.trim()}
                  onClick={publish}
                >
                  {busy ? "Publishing…" : "Publish update"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
