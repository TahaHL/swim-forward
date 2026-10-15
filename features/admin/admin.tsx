"use client";
import { useState, type FormEvent } from "react";
import type { Data } from "@/features/progress/model";
import Management from "./management";
type Field = {
  name: string;
  label: string;
  type?: string;
  options?: { id: string; name: string }[];
};
export default function Admin({
  data,
  demo,
  onSaved,
}: {
  data: Data;
  demo: boolean;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState("swimmer"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const fields: Record<string, Field[]> = {
    swimmer: [
      { name: "first_name", label: "First name" },
      { name: "last_name", label: "Last name" },
      { name: "birth_year", label: "Year of birth", type: "number" },
      { name: "lesson_stage", label: "Current lesson stage" },
    ],
    venue: [
      { name: "name", label: "Venue name" },
      { name: "address", label: "Address" },
    ],
    programme: [
      { name: "name", label: "Programme name" },
      { name: "description", label: "Description" },
    ],
    block: [
      { name: "name", label: "Block name" },
      { name: "programme_id", label: "Programme", options: data.programmes },
      { name: "venue_id", label: "Venue", options: data.venues },
      {
        name: "format",
        label: "Format",
        options: [
          { id: "one_to_one", name: "One to one" },
          { id: "small_group", name: "Small group" },
        ],
      },
      { name: "capacity", label: "Capacity", type: "number" },
      { name: "starts_on", label: "Start date", type: "date" },
      { name: "ends_on", label: "End date", type: "date" },
    ],
    session: [
      { name: "block_id", label: "Block", options: data.blocks },
      { name: "week", label: "Week (1–6)", type: "number" },
      {
        name: "starts_at",
        label: "Start (ISO time with timezone, e.g. 2026-11-01T10:00:00Z)",
      },
      { name: "ends_at", label: "End (ISO time with timezone)" },
    ],
    enrolment: [
      { name: "block_id", label: "Block", options: data.blocks },
      {
        name: "swimmer_id",
        label: "Swimmer",
        options: data.swimmers.map((s) => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
        })),
      },
    ],
    instructor: [
      { name: "block_id", label: "Block", options: data.blocks },
      { name: "user_id", label: "Existing instructor account ID" },
    ],
    selected_skill: [
      {
        name: "swimmer_id",
        label: "Swimmer",
        options: data.swimmers.map((s) => ({ id: s.id, name: s.first_name })),
      },
      {
        name: "skill_id",
        label: "Skill",
        options: data.skills.map((s) => ({ id: s.id, name: s.title })),
      },
    ],
    skill: [
      { name: "title", label: "Skill name" },
      { name: "stroke", label: "Stroke" },
      { name: "category", label: "Category" },
      { name: "explanation", label: "Why it matters" },
      {
        name: "criteria",
        label: "Success criteria (one per line)",
        type: "textarea",
      },
    ],
  };
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      setNotice("Demonstration only — no changes saved.");
      return;
    }
    setBusy(true);
    const form = e.currentTarget;
    try {
      const values = Object.fromEntries(new FormData(form));
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          values,
          organisationId: data.user.roles.find((r) => r.role === "admin")
            ?.organisation_id,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw Error(body.error);
      setNotice("Saved");
      form.reset();
      onSaved();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="muted">Your operation</p>
      <h1>Coaching, organised.</h1>
      <div className="admin-tabs">
        {Object.keys(fields).map((k) => (
          <button
            className={kind === k ? "button primary" : "button secondary"}
            key={k}
            onClick={() => {
              setKind(k);
              setNotice("");
            }}
          >
            {k.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <form key={kind} className="form-section" onSubmit={submit}>
        <h2>Add {kind.replaceAll("_", " ")}</h2>
        {fields[kind].map((f) => (
          <label key={f.name}>
            {f.label}
            {f.options ? (
              <select name={f.name} required>
                <option value="">Choose…</option>
                {f.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea name={f.name} required />
            ) : (
              <input
                name={f.name}
                type={f.type ?? "text"}
                required={f.name !== "lesson_stage"}
                maxLength={2000}
              />
            )}
          </label>
        ))}
        <button disabled={busy} className="button primary">
          Save {kind.replaceAll("_", " ")}
        </button>
        <p role="status">{notice}</p>
      </form>
      <p className="muted small">
        New blocks are closed to bookings. New skills require teaching criteria
        approval before assessment.
      </p>
      <Management data={data} demo={demo} onSaved={onSaved} />
    </>
  );
}
