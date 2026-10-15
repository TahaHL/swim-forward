import { z } from "zod";
import { input, result } from "@/lib/http";
import { database, identity } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    const body = await input(
      request,
      z.discriminatedUnion("action", [
        z.object({
          action: z.literal("delete-request"),
          swimmerId: z.string().uuid(),
        }),
        z.object({
          action: z.literal("consent"),
          version: z.literal("template-2026-10"),
        }),
      ]),
    );
    if (!(await identity())) return result({ error: "Sign in again." }, 401);
    const db = await database();
    const { error } =
      body.action === "consent"
        ? await db.rpc("accept_notice", { p_version: body.version })
        : await db.rpc("request_deletion", { p_swimmer: body.swimmerId });
    return error
      ? result({ error: "Request could not be saved. Try again." }, 400)
      : result({ ok: true });
  } catch {
    return result({ error: "Invalid request." }, 400);
  }
}
