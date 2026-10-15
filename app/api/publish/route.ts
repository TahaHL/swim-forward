import { z } from "zod";
import { database, identity } from "@/lib/supabase/server";
import { input, result } from "@/lib/http";
const schema = z.object({
  swimmer: z.string().uuid(),
  session: z.string().uuid(),
  note: z.string().trim().min(1).max(1500),
  focus: z.string().trim().min(1).max(300),
  internal: z.string().max(2000),
  requestId: z.string().uuid(),
  ratings: z
    .array(
      z.object({
        skill_id: z.string().uuid(),
        status: z.enum(["needs_practice", "fair", "good", "pass"]).nullable(),
        observation: z.string().max(1000),
        target: z.string().max(500),
      }),
    )
    .max(100),
});
export async function POST(request: Request) {
  try {
    const body = await input(request, schema);
    if (!(await identity()))
      return result(
        { error: "Sign in again. Your draft has not been published." },
        401,
      );
    const db = await database();
    const { data, error } = await db.rpc("publish_update", {
      p_swimmer: body.swimmer,
      p_session: body.session,
      p_note: body.note,
      p_focus: body.focus,
      p_ratings: body.ratings,
      p_internal: body.internal,
      p_request: body.requestId,
    });
    if (error)
      return result(
        {
          error:
            "Update not published. Check your session, selected skills and permissions, then retry.",
        },
        409,
      );
    return result({ id: data });
  } catch {
    return result(
      {
        error:
          "Check all fields before publishing. Your draft is still available.",
      },
      400,
    );
  }
}
