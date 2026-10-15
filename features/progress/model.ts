export const statuses = ["needs_practice", "fair", "good", "pass"] as const;
export type Status = (typeof statuses)[number] | null;
export const statusLabels = {
  none: "Not Assessed",
  needs_practice: "Needs Practice",
  fair: "Fair",
  good: "Good",
  pass: "Pass",
};
export type Skill = {
  id: string;
  legacy_id: string | null;
  title: string;
  stroke: string;
  category: string;
  explanation: string;
  criteria: string[];
  approved_at: string | null;
  retired_at: string | null;
};
export type Swimmer = {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number;
  lesson_stage: string;
  organisation_id: string;
};
export type Assessment = {
  id: string;
  sequence: number;
  update_id: string;
  swimmer_id: string;
  skill_id: string;
  status: Status;
  observation: string;
  target: string;
  created_at: string;
};
export type Block = {
  id: string;
  name: string;
  programme_id: string;
  venue_id: string;
  starts_on: string;
  ends_on: string;
  price_pence: number;
  capacity: number;
  format: string;
  bookable: boolean;
};
export type Session = {
  id: string;
  block_id: string;
  week: number;
  starts_at: string;
  ends_at: string;
  cancelled: boolean;
};
export type Update = {
  id: string;
  swimmer_id: string;
  session_id: string;
  note: string;
  focus: string;
  created_at: string;
};
export type Data = {
  user: {
    id: string;
    email: string;
    name: string;
    roles: { role: string; organisation_id: string }[];
  };
  swimmers: Swimmer[];
  skills: Skill[];
  assessments: Assessment[];
  updates: Update[];
  blocks: Block[];
  sessions: Session[];
  venues: { id: string; name: string }[];
  programmes: { id: string; name: string }[];
  swimmer_skills: { swimmer_id: string; skill_id: string; goal: string }[];
  enrolments: { swimmer_id: string; block_id: string }[];
  notifications: {
    id: string;
    kind: string;
    created_at: string;
    read_at: string | null;
  }[];
  bookings: {
    id: string;
    block_id: string;
    swimmer_id: string;
    status: string;
    amount_pence: number;
  }[];
  consents: { notice_version: string }[];
};
export function currentRatings(events: Assessment[], at = Infinity) {
  const current = new Map<string, Assessment>();
  for (const event of events) {
    if (new Date(event.created_at).getTime() > at) continue;
    if (
      !current.has(event.skill_id) ||
      current.get(event.skill_id)!.sequence < event.sequence
    )
      current.set(event.skill_id, event);
  }
  return current;
}
export function improved(before: Status, after: Status) {
  return (
    before !== null &&
    after !== null &&
    statuses.indexOf(after) > statuses.indexOf(before)
  );
}
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date(value));
