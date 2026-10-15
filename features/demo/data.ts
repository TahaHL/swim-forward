import { SKILLS } from "../skills/original";
import type { Data, Assessment } from "../progress/model";
const events: Assessment[] = [];
for (const [index, skill] of SKILLS.entries()) {
  events.push({
    id: `baseline-${skill.id}`,
    sequence: index,
    swimmer_id: "demo-swimmer",
    skill_id: skill.id,
    update_id: "week1",
    status: index < 3 ? "good" : "fair",
    observation: "A starting point for this coaching block.",
    target: "",
    created_at: "2026-10-01T15:00:00Z",
  });
}
for (const [index, skill] of SKILLS.entries()) {
  events.push({
    id: `current-${skill.id}`,
    sequence: 100 + index,
    swimmer_id: "demo-swimmer",
    skill_id: skill.id,
    update_id: "week3",
    status: skill.id === "kick-ankles" ? "fair" : index < 5 ? "pass" : "good",
    observation:
      skill.id === "kick-ankles"
        ? "Oliver points his toes more often, but his ankles tighten when he concentrates on his arms."
        : "The movement is becoming steadier and more comfortable.",
    target:
      skill.id === "kick-ankles"
        ? "Kick 5 metres with loose ankles and pointed toes, three times in a row."
        : "Keep the movement steady throughout the swim.",
    created_at: "2026-10-15T15:00:00Z",
  });
}
export const demoData: Data = {
  user: {
    id: "demo-user",
    name: "Alex",
    email: "parent@example.test",
    roles: [],
  },
  swimmers: [
    {
      id: "demo-swimmer",
      first_name: "Oliver",
      last_name: "Example",
      birth_year: 2018,
      lesson_stage: "Stage 3",
      organisation_id: "demo-org",
    },
  ],
  skills: SKILLS.map((s) => ({
    id: s.id,
    legacy_id: s.id,
    title: s.name,
    stroke: "front_crawl",
    category: s.categoryId,
    explanation: s.whyItMatters,
    criteria: s.successCriteria,
    approved_at: "2026-10-01",
    retired_at: null,
  })),
  assessments: events,
  updates: [
    {
      id: "week1",
      swimmer_id: "demo-swimmer",
      session_id: "session1",
      note: "A starting point for this block. Oliver is comfortable in the water and ready to work on a steady kick.",
      focus: "A steady kick from the hips.",
      created_at: "2026-10-01T15:00:00Z",
    },
    {
      id: "week3",
      swimmer_id: "demo-swimmer",
      session_id: "session3",
      note: "Oliver found a lovely rhythm today. His kick stayed steady as he turned to breathe, and he finished with a confident swim.",
      focus: "Keep the ankles relaxed when the arms start moving.",
      created_at: "2026-10-15T15:00:00Z",
    },
  ],
  programmes: [{ id: "programme", name: "Front crawl development" }],
  blocks: [
    {
      id: "block",
      name: "Autumn block",
      programme_id: "programme",
      venue_id: "venue",
      starts_on: "2026-10-01",
      ends_on: "2026-11-05",
      price_pence: 0,
      capacity: 4,
      format: "small_group",
      bookable: false,
    },
  ],
  sessions: Array.from({ length: 6 }, (_, i) => ({
    id: `session${i + 1}`,
    block_id: "block",
    week: i + 1,
    starts_at: new Date(Date.UTC(2026, 9, 1 + i * 7, 15)).toISOString(),
    ends_at: new Date(Date.UTC(2026, 9, 1 + i * 7, 15, 30)).toISOString(),
    cancelled: false,
  })),
  venues: [{ id: "venue", name: "Example pool" }],
  swimmer_skills: SKILLS.map((s) => ({
    swimmer_id: "demo-swimmer",
    skill_id: s.id,
    goal: "",
  })),
  enrolments: [{ swimmer_id: "demo-swimmer", block_id: "block" }],
  notifications: [
    {
      id: "notification",
      kind: "assessment_published",
      created_at: "2026-10-15",
      read_at: null,
    },
  ],
  bookings: [],
  consents: [{ notice_version: "template-2026-10" }],
};
