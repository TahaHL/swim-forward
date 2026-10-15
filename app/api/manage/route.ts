import { z } from "zod";
import { input, result } from "@/lib/http";
import { database, identity } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    const body = await input(
      request,
      z.object({
        action: z.enum([
          "approve_skill",
          "retire_skill",
          "edit_skill",
          "open_block",
          "revoke_parent",
          "attendance",
        ]),
        id: z.string().uuid(),
        values: z.record(z.unknown()).default({}),
      }),
    );
    if (!(await identity())) return result({ error: "Sign in again." }, 401);
    const { error } = await (
      await database()
    ).rpc("manage_record", {
      p_action: body.action,
      p_id: body.id,
      p_values: body.values,
    });
    return error
      ? result(
          {
            error:
              "Could not save. Check the criteria, schedule and your permissions.",
          },
          400,
        )
      : result({ ok: true });
  } catch {
    return result({ error: "Check the fields and try again." }, 400);
  }
}
