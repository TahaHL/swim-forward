import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { input, result } from "@/lib/http";
import { database, identity } from "@/lib/supabase/server";
export async function POST(request: Request) {
  try {
    const body = await input(
      request,
      z.discriminatedUnion("action", [
        z.object({
          action: z.literal("create"),
          swimmerId: z.string().uuid(),
          email: z.string().email().max(254),
        }),
        z.object({
          action: z.literal("accept"),
          token: z.string().regex(/^[a-f0-9]{64}$/),
        }),
      ]),
    );
    if (!(await identity())) return result({ error: "Sign in again." }, 401);
    const db = await database();
    if (body.action === "accept") {
      const { error } = await db.rpc("accept_invitation", {
        p_hash: createHash("sha256").update(body.token).digest("hex"),
      });
      return error
        ? result(
            {
              error:
                "Invitation expired, used or sent to another email. Ask your coach for a new one.",
            },
            400,
          )
        : result({ ok: true });
    }
    const token = randomBytes(32).toString("hex");
    const { error } = await db.rpc("invite_parent", {
      p_swimmer: body.swimmerId,
      p_email: body.email,
      p_hash: createHash("sha256").update(token).digest("hex"),
    });
    return error
      ? result(
          {
            error:
              "Invitation could not be created. Check access or wait before trying again.",
          },
          400,
        )
      : result({ token });
  } catch {
    return result({ error: "Check the invitation details." }, 400);
  }
}
