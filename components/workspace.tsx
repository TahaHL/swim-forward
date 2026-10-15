"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  House,
  ListChecks,
  ChartNoAxesCombined,
  UserRound,
  CalendarDays,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";
import { Brand, Skeleton } from "./core";
import Parent from "@/features/progress/parent";
import Assessment from "@/features/coaching/assessment";
import type { Data } from "@/features/progress/model";
import Admin from "@/features/admin/admin";
import AccountLink from "./account-link";
import Consent from "./consent";

export default function Workspace({
  initial,
  demo = false,
}: {
  initial?: Data;
  demo?: boolean;
}) {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(initial ?? null),
    [tab, setTab] = useState("home"),
    [selected, setSelected] = useState(""),
    [error, setError] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [previewTab, setPreviewTab] = useState("home");
  const [demoRole, setDemoRole] = useState("parent"),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    if (demo) return;
    try {
      const response = await fetch("/api/data", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      setData(body);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection unavailable. Try again.",
      );
    }
  }, [demo]);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  const role = demo
    ? demoRole
    : data?.user.roles.some((r) => r.role === "admin")
      ? "admin"
      : data?.user.roles.length
        ? "instructor"
        : "parent";
  const swimmerId =
    data?.swimmers.find((s) => s.id === selected)?.id ??
    data?.swimmers[0]?.id ??
    "";
  const activeTab =
    role !== "parent" &&
    ["home", "progress", "journey", "bookings"].includes(tab)
      ? "swimmers"
      : tab;
  const tabs =
    role === "parent"
      ? ([
          ["home", "Home", House],
          ["progress", "Skills", ListChecks],
          ["journey", "Journey", ChartNoAxesCombined],
          ["bookings", "Bookings", CalendarDays],
          ["profile", "Profile", UserRound],
        ] as const)
      : ([
          ["assessment", "Assess", ListChecks],
          ["swimmers", "Swimmers", UserRound],
          ...(role === "admin" ? [["admin", "Manage", Settings] as const] : []),
          ["profile", "Profile", UserRound],
        ] as const);
  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    for (const key of Object.keys(localStorage))
      if (key.startsWith("swim-draft:")) localStorage.removeItem(key);
    router.push("/sign-in");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-caption">A clearer picture of progress.</p>
        <nav aria-label="Main navigation">
          {(previewId ? [] : tabs).map(([id, label, Icon]) => (
            <button
              key={id}
              className={activeTab === id ? "active" : ""}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="avatar">
            {(data?.user.name || "SP").slice(0, 2)}
          </span>
          <span>
            {data?.user.name || "Your account"}
            <small>
              {role === "parent" ? "Parent account" : "Coaching team"}
            </small>
          </span>
        </div>
      </aside>
      <div className="workspace">
        <header className="app-header">
          <span className="mobile-brand">Swim Forward</span>
          <span className="desktop-greeting">
            {role === "parent" ? "Your child. Their own pace." : "Swim Forward"}
          </span>
          <div className="header-actions">
            {role === "parent" && data && data.swimmers.length > 1 && (
              <label className="child-picker">
                <span className="sr-only">Choose child</span>
                <select
                  value={swimmerId}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {data.swimmers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {role === "parent" && (
              <button
                className="icon-button"
                aria-label="Notifications"
                onClick={() => setTab("notifications")}
              >
                <Bell size={20} />
              </button>
            )}
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <span>
              Demonstration only. Fictional records. No live payments.
            </span>
            <label>
              <span className="sr-only">Preview role</span>
              <select
                value={demoRole}
                onChange={(e) => {
                  setDemoRole(e.target.value);
                  setPreviewId("");
                  setTab(
                    e.target.value === "parent"
                      ? "home"
                      : e.target.value === "admin"
                        ? "admin"
                        : "assessment",
                  );
                }}
              >
                <option value="parent">Parent view</option>
                <option value="instructor">Instructor view</option>
                <option value="admin">Admin view</option>
              </select>
            </label>
          </div>
        )}
        <main id="main" className="main-content">
          {error ? (
            <div className="empty" role="alert">
              <h1>Updates could not be loaded</h1>
              <p>{error}</p>
              <button className="button primary" onClick={load}>
                Try again
              </button>
              <Link href="/sign-in">Sign in</Link>
            </div>
          ) : !data ? (
            <Skeleton />
          ) : !demo && role === "parent" && !data.consents.length ? (
            <Consent onSaved={load} />
          ) : previewId && role !== "parent" ? (
            <>
              <section className="notice" aria-label="Parent preview">
                <h2>Viewing as a parent</h2>
                <p>
                  Published updates for{" "}
                  {data.swimmers.find((s) => s.id === previewId)?.first_name}.
                  Unpublished assessment drafts are not shown.
                </p>
                <button
                  className="button secondary"
                  onClick={() => setPreviewId("")}
                >
                  Return to instructor view
                </button>
              </section>
              <nav
                aria-label="Parent preview navigation"
                className="hero-actions"
              >
                {[
                  ["home", "Home"],
                  ["progress", "Skills"],
                  ["journey", "Journey"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className="button secondary"
                    aria-current={previewTab === id ? "page" : undefined}
                    onClick={() => setPreviewTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <Parent
                data={data}
                swimmerId={previewId}
                tab={previewTab}
                demo={demo}
              />
            </>
          ) : (
            <>
              {activeTab === "swimmers" && role !== "parent" && (
                <>
                  <h1>Your swimmers</h1>
                  <p className="intro">
                    Choose a swimmer to view their profile.
                  </p>
                  {data.swimmers.length === 0 && (
                    <p>
                      No swimmers yet. Ask your administrator to assign swimmers
                      to your coaching blocks.
                    </p>
                  )}
                  <div className="form-section">
                    {data.swimmers.map((s) => (
                      <button
                        key={s.id}
                        className="list-row text-button"
                        aria-pressed={swimmerId === s.id}
                        onClick={() => setSelected(s.id)}
                      >
                        {s.first_name} {s.last_name}
                      </button>
                    ))}
                  </div>
                  {data.swimmers
                    .filter((s) => s.id === swimmerId)
                    .map((s) => (
                      <section
                        className="form-section"
                        key={s.id}
                        aria-label="Swimmer profile"
                      >
                        <h2>
                          {s.first_name} {s.last_name}
                        </h2>
                        <p>{s.lesson_stage || "Lesson stage not recorded"}</p>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setPreviewTab("home");
                            setPreviewId(s.id);
                          }}
                        >
                          Preview as parent
                        </button>
                      </section>
                    ))}
                </>
              )}

              {role === "parent" &&
                ["home", "progress", "journey"].includes(activeTab) && (
                  <Parent
                    data={data}
                    swimmerId={swimmerId}
                    tab={tab}
                    demo={demo}
                  />
                )}
              {activeTab === "assessment" && role !== "parent" && (
                <Assessment data={data} demo={demo} onSaved={load} />
              )}
              {tab === "admin" && role === "admin" && (
                <Admin data={data} demo={demo} onSaved={load} />
              )}
              {tab === "notifications" && (
                <>
                  <h1>Your updates</h1>
                  {data.notifications.length ? (
                    data.notifications.map((n) => (
                      <div className="list-row" key={n.id}>
                        <span>You have a new update from your coach</span>
                        <button
                          className="text-button"
                          onClick={() => setTab("home")}
                        >
                          View update
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      <h2>You’re up to date</h2>
                      <p>New coaching updates will appear here.</p>
                    </div>
                  )}
                </>
              )}
              {tab === "profile" && (
                <>
                  <h1>Your account</h1>
                  {role === "parent" && (
                    <AccountLink demo={demo} onSaved={load} />
                  )}
                  <div className="form-section">
                    <p>{data.user.email}</p>
                    {role === "parent" && (
                      <>
                        <p>
                          Your linked children’s records are available to
                          download.
                        </p>
                        <a
                          className="button secondary"
                          href={demo ? "/demo" : "/api/export"}
                          onClick={(e) => {
                            if (demo) {
                              e.preventDefault();
                              setNotice(
                                "Demonstration only — no personal records to export.",
                              );
                            }
                          }}
                        >
                          Download records
                        </a>
                        <button
                          className="text-button"
                          onClick={async () => {
                            if (demo) {
                              setNotice(
                                "Demonstration only — no deletion request sent.",
                              );
                              return;
                            }
                            const r = await fetch("/api/account", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "delete-request",
                                swimmerId,
                              }),
                            });
                            setNotice(
                              r.ok
                                ? "Deletion requested"
                                : "Request not sent. Try again.",
                            );
                          }}
                        >
                          Request deletion
                        </button>
                      </>
                    )}
                    <Link href="/privacy">Privacy notice template</Link>
                    <button className="button secondary" onClick={logout}>
                      <LogOut size={18} />
                      Sign out
                    </button>
                    <p role="status">{notice}</p>
                  </div>
                </>
              )}
              {tab === "bookings" && (
                <>
                  <h1>Your coaching blocks</h1>
                  <p className="intro">
                    Your coach organises your sessions and next steps.
                  </p>
                  {data.blocks
                    .filter((b) =>
                      data.enrolments.some(
                        (e) =>
                          e.block_id === b.id && e.swimmer_id === swimmerId,
                      ),
                    )
                    .map((b) => (
                      <section className="booking-card" key={b.id}>
                        <h2>{b.name}</h2>
                        <p>
                          {b.format === "one_to_one"
                            ? "One to one"
                            : "Small group"}{" "}
                          coaching
                        </p>
                        <p>
                          {b.starts_on} to {b.ends_on}
                        </p>
                      </section>
                    ))}
                  <section className="notice">
                    <h2>Online booking and pricing</h2>
                    <p>
                      Coming later. Speak to your coach about joining another
                      block.
                    </p>
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
