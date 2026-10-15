import { z } from "zod";
import { database, identity } from "@/lib/supabase/server";
import { input, result } from "@/lib/http";
const text = z.string().trim().min(1).max(2000),
  id = z.string().uuid();
const schemas = {
  swimmer: z.object({
    first_name: text.max(80),
    last_name: text.max(80),
    birth_year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
    lesson_stage: z.string().max(100),
  }),
  venue: z.object({ name: text.max(100), address: text }),
  programme: z.object({ name: text.max(100), description: text }),
  block: z.object({
    name: text.max(100),
    programme_id: id,
    venue_id: id,
    format: z.enum(["one_to_one", "small_group"]),
    capacity: z.coerce.number().int().min(1).max(50),
    starts_on: z.string().date(),
    ends_on: z.string().date(),
  }),
  session: z.object({
    block_id: id,
    week: z.coerce.number().int().min(1).max(6),
    starts_at: z.string().datetime({ offset: true }),
    ends_at: z.string().datetime({ offset: true }),
  }),
  skill: z.object({
    title: text.max(100),
    stroke: text.max(50),
    category: text.max(50),
    explanation: text,
    criteria: text.transform((v) =>
      v
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  }),
  enrolment: z.object({ block_id: id, swimmer_id: id }),
  instructor: z.object({ block_id: id, user_id: id }),
  selected_skill: z.object({ swimmer_id: id, skill_id: id }),
};
export async function POST(request: Request) {
  try {
    const body = await input(
      request,
      z.object({
        kind: z.enum([
          "swimmer",
          "venue",
          "programme",
          "block",
          "session",
          "skill",
          "enrolment",
          "instructor",
          "selected_skill",
        ]),
        organisationId: id,
        values: z.record(z.unknown()),
      }),
    );
    const user = await identity();
    if (
      !user?.roles.some(
        (r) => r.role === "admin" && r.organisation_id === body.organisationId,
      )
    )
      return result({ error: "Administrator access is required." }, 403);
    const values = schemas[body.kind].parse(body.values),
      db = await database();
    if (["enrolment", "instructor", "selected_skill"].includes(body.kind)) {
      const { error } = await db.rpc("admin_link", {
        p_kind: body.kind,
        p_org: body.organisationId,
        p_values: values,
      });
      return error
        ? result(
            {
              error:
                "Could not link these records. Check their organisation and assignment.",
            },
            400,
          )
        : result({ ok: true });
    }
    const table = {
      swimmer: "swimmers",
      venue: "venues",
      programme: "programmes",
      block: "blocks",
      session: "sessions",
      skill: "skills",
    }[
      body.kind as
        "swimmer" | "venue" | "programme" | "block" | "session" | "skill"
    ];
    const { error } = await db.from(table).insert({
      ...values,
      ...(body.kind === "session"
        ? {}
        : { organisation_id: body.organisationId }),
    });
    return error
      ? result(
          {
            error: "Could not save. Check the fields, dates and organisation.",
          },
          400,
        )
      : result({ ok: true });
  } catch {
    return result({ error: "Check all fields and try again." }, 400);
  }
}
