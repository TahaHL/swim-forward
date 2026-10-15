"use client";
import { useState } from "react";
import { Check, ChevronRight, CalendarDays, Info } from "lucide-react";
import { Lane, Sheet, StatusMark } from "@/components/core";
import {
  currentRatings,
  formatDate,
  formatTime,
  improved,
  statusLabels,
  type Data,
  type Skill,
} from "./model";

export default function Parent({
  data,
  tab,
  swimmerId,
  demo,
}: {
  data: Data;
  tab: string;
  swimmerId: string;
  demo: boolean;
}) {
  const [now] = useState(() => Date.now());
  const [detail, setDetail] = useState<Skill | null>(null),
    [help, setHelp] = useState(false);
  const child = data.swimmers.find((s) => s.id === swimmerId);
  const updates = data.updates
    .filter((u) => u.swimmer_id === swimmerId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const latest = updates.at(-1),
    previous = updates.at(-2);
  const events = data.assessments.filter((a) => a.swimmer_id === swimmerId),
    current = currentRatings(events);
  const prior = currentRatings(
    events,
    previous ? new Date(previous.created_at).getTime() : 0,
  );
  const selected = new Set(
    data.swimmer_skills
      .filter((s) => s.swimmer_id === swimmerId)
      .map((s) => s.skill_id),
  );
  const skills = data.skills.filter(
    (s) => selected.has(s.id) && s.approved_at && !s.retired_at,
  );
  const gains = skills.filter((s) =>
    improved(
      prior.get(s.id)?.status ?? null,
      current.get(s.id)?.status ?? null,
    ),
  );
  const focus = skills
    .filter((s) => {
      const a = current.get(s.id);
      return a?.status && a.status !== "pass" && a.observation;
    })
    .sort(
      (a, b) =>
        (current.get(a.id)?.status === "fair" ? -1 : 1) -
        (current.get(b.id)?.status === "fair" ? -1 : 1),
    )
    .slice(0, 1);
  const blocks = data.enrolments
    .filter((e) => e.swimmer_id === swimmerId)
    .map((e) => e.block_id);
  const sessions = data.sessions
    .filter((s) => blocks.includes(s.block_id) && !s.cancelled)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const session = data.sessions.find((s) => s.id === latest?.session_id),
    block = data.blocks.find((b) => b.id === (session?.block_id ?? blocks[0]));
  const next = sessions.find(
    (s) =>
      new Date(s.starts_at).getTime() >
      (demo ? new Date("2026-10-16").getTime() : now),
  );
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const beforeUpdate = updates.find((u) => u.id === from) ?? updates[0],
    afterUpdate = updates.find((u) => u.id === to) ?? latest;
  const before = currentRatings(
      events,
      beforeUpdate ? new Date(beforeUpdate.created_at).getTime() : 0,
    ),
    after = currentRatings(
      events,
      afterUpdate ? new Date(afterUpdate.created_at).getTime() : 0,
    );
  if (!child)
    return (
      <section className="empty">
        <h1>Your child’s progress starts here</h1>
        <p>
          Ask your coach for a parent invitation to link your child. Your
          updates will appear here after the first session is published.
        </p>
      </section>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="muted">{block?.name ?? "Your coaching"}</p>
          <h1>
            {tab === "journey"
              ? "The journey so far"
              : tab === "progress"
                ? "Skills, one step at a time"
                : `${child.first_name}’s swimming`}
          </h1>
        </div>
        <button
          className="icon-button"
          aria-label="About technique ratings"
          onClick={() => setHelp(true)}
        >
          <Info size={20} />
        </button>
      </div>
      {tab === "home" && (
        <>
          <div className="week-line">
            <span>
              {block
                ? `Week ${session?.week ?? 1} of 6`
                : "Awaiting a coaching block"}
            </span>
            <span>
              {block
                ? "Front crawl development"
                : "Your coach will confirm your plan"}
            </span>
          </div>
          {block && <Lane week={session?.week ?? 1} />}
          <section className="coach-note">
            <div className="section-heading">
              <h2>Your latest update</h2>
              {latest && <time>{formatDate(latest.created_at)}</time>}
            </div>
            <p className="note-text">
              {latest?.note ??
                "Your coach will share how the session went after publishing your first update."}
            </p>
            <span className="muted">From your coach</span>
          </section>
          {latest && (
            <section className="focus-panel">
              <span className="focus-marker" />
              <div>
                <h2>The next focus</h2>
                <p>{latest.focus}</p>
              </div>
            </section>
          )}
          <div className="parent-columns">
            <section>
              <div className="section-heading">
                <h2>What improved</h2>
              </div>
              {gains.length ? (
                gains.slice(0, 3).map((s) => (
                  <button
                    className="list-row"
                    key={s.id}
                    onClick={() => setDetail(s)}
                  >
                    <span>
                      <strong>{s.title}</strong>
                      <span className="rating-transition">
                        {statusLabels[prior.get(s.id)?.status ?? "none"]}{" "}
                        <span aria-hidden>→</span>{" "}
                        {statusLabels[current.get(s.id)?.status ?? "none"]}
                      </span>
                    </span>
                    <ChevronRight size={18} aria-hidden />
                  </button>
                ))
              ) : (
                <p className="muted">
                  After two updates, you’ll see changes here. Progress can take
                  time.
                </p>
              )}
            </section>
            <section className="next-session">
              <h2>Next session</h2>
              {next ? (
                <>
                  <CalendarDays size={24} aria-hidden />
                  <p className="session-date">{formatDate(next.starts_at)}</p>
                  <p>
                    {formatTime(next.starts_at)}–{formatTime(next.ends_at)}
                  </p>
                  <p className="muted">
                    {
                      data.venues.find(
                        (v) =>
                          v.id ===
                          data.blocks.find((b) => b.id === next.block_id)
                            ?.venue_id,
                      )?.name
                    }
                  </p>
                </>
              ) : (
                <p className="muted">
                  Your coach will confirm the next session here.
                </p>
              )}
            </section>
          </div>
          <section>
            <div className="section-heading">
              <h2>What needs practice</h2>
              <span className="muted">A little more attention</span>
            </div>
            {focus.length ? (
              focus.map((s) => {
                const a = current.get(s.id)!;
                return (
                  <article className="practice-item" key={s.id}>
                    <div className="section-heading">
                      <h3>{s.title}</h3>
                      <StatusMark value={a.status} />
                    </div>
                    <p>{a.observation}</p>
                    {a.target && (
                      <p className="target">
                        <strong>Next target</strong>
                        {a.target}
                      </p>
                    )}
                    <button
                      className="text-button"
                      onClick={() => setDetail(s)}
                    >
                      View details
                    </button>
                  </article>
                );
              })
            ) : (
              <p className="muted">
                Your coach will add the next priorities after an assessment.
              </p>
            )}
          </section>
        </>
      )}
      {tab === "progress" && (
        <>
          {Array.from(new Set(skills.map((s) => s.stroke))).map((stroke) => (
            <section key={stroke}>
              <h2 className="stroke-heading">{stroke.replaceAll("_", " ")}</h2>
              {Array.from(
                new Set(
                  skills
                    .filter((s) => s.stroke === stroke)
                    .map((s) => s.category),
                ),
              ).map((group) => (
                <section className="skill-group" key={group}>
                  <h3>{group.replaceAll("_", " ")}</h3>
                  {skills
                    .filter((s) => s.category === group && s.stroke === stroke)
                    .map((s) => (
                      <button
                        className="list-row"
                        key={s.id}
                        onClick={() => setDetail(s)}
                      >
                        <span
                          className={`check-box ${current.get(s.id)?.status === "pass" ? "checked" : ""}`}
                          aria-label={
                            current.get(s.id)?.status === "pass"
                              ? "Complete"
                              : "Not complete"
                          }
                        >
                          {current.get(s.id)?.status === "pass" && (
                            <Check size={16} />
                          )}
                        </span>
                        <span className="row-title">{s.title}</span>
                        <StatusMark value={current.get(s.id)?.status ?? null} />
                        <ChevronRight size={16} aria-hidden />
                      </button>
                    ))}
                </section>
              ))}
            </section>
          ))}
        </>
      )}
      {tab === "journey" && (
        <>
          <p className="intro">
            Compare two updates. Each skill develops at its own pace.
          </p>
          {updates.length > 1 ? (
            <>
              <div className="comparison-selectors">
                <label>
                  From
                  <select
                    aria-label="From"
                    value={beforeUpdate?.id ?? ""}
                    onChange={(e) => setFrom(e.target.value)}
                  >
                    {updates.map((u) => (
                      <option key={u.id} value={u.id}>
                        {formatDate(u.created_at)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  To
                  <select
                    aria-label="To"
                    value={afterUpdate?.id ?? ""}
                    onChange={(e) => setTo(e.target.value)}
                  >
                    {updates.map((u) => (
                      <option key={u.id} value={u.id}>
                        {formatDate(u.created_at)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {skills.map((s) => (
                <button
                  key={s.id}
                  className="list-row comparison-row"
                  onClick={() => setDetail(s)}
                >
                  <span className="row-title">{s.title}</span>
                  <StatusMark value={before.get(s.id)?.status ?? null} />
                  <span aria-hidden>→</span>
                  <StatusMark value={after.get(s.id)?.status ?? null} />
                </button>
              ))}
            </>
          ) : (
            <div className="empty">
              <h2>A starting point, then a story</h2>
              <p>Once your coach has shared two updates, compare them here.</p>
            </div>
          )}
        </>
      )}
      {detail && (
        <Sheet title={detail.title} onClose={() => setDetail(null)}>
          <StatusMark value={current.get(detail.id)?.status ?? null} />
          <p>{detail.explanation}</p>
          <h3>Coach’s observation</h3>
          <p>
            {current.get(detail.id)?.observation ||
              "Your coach has not added an observation yet."}
          </p>
          <h3>Next target</h3>
          <p>
            {current.get(detail.id)?.target ||
              "Your coach will agree a target at your next assessment."}
          </p>
          <details>
            <summary>Success criteria</summary>
            <ul>
              {detail.criteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </details>
          <h3>History</h3>
          {events
            .filter((a) => a.skill_id === detail.id)
            .sort((a, b) => b.sequence - a.sequence)
            .map((a) => (
              <div className="list-row" key={a.id}>
                <time>{formatDate(a.created_at)}</time>
                <StatusMark value={a.status} />
              </div>
            ))}
        </Sheet>
      )}
      {help && (
        <Sheet title="Understanding the ratings" onClose={() => setHelp(false)}>
          <p>
            These are supplementary technique observations. A Pass completes one
            skill; it is not an official swimming-stage award.
          </p>
          <p>
            Not Assessed means there is no current assessment. Good and Pass are
            different. A later rating can change in either direction as your
            coach observes the skill.
          </p>
          <p>
            Rating descriptions remain provisional until the programme owner
            approves them. Ask your coach about the criteria used for your
            child.
          </p>
        </Sheet>
      )}
    </>
  );
}
