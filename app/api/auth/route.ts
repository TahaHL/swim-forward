import { z } from "zod";
import { database, configured } from "@/lib/supabase/server";
import { input, result } from "@/lib/http";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("send"),
    email: z.string().email().max(254),
    captchaToken: z.string().optional(),
  }),
  z.object({
    action: z.literal("verify"),
    email: z.string().email().max(254),
    token: z.string().regex(/^\d{6,10}$/),
  }),
  z.object({ action: z.literal("logout") }),
]);
export async function POST(request: Request) {
  if (!configured())
    return result(
      { error: "Sign-in is not configured yet. Contact the programme owner." },
      503,
    );
  try {
    const body = await input(request, schema),
      db = await database();
    if (body.action === "logout") {
      await db.auth.signOut();
      return result({ ok: true });
    }
    if (body.action === "send") {
      const { error } = await db.auth.signInWithOtp({
        email: body.email,
        options: { shouldCreateUser: true, captchaToken: body.captchaToken },
      });
      if (error)
        return result(
          { error: "A code could not be sent. Wait a minute and try again." },
          429,
        );
      return result({ ok: true });
    }
    const { error } = await db.auth.verifyOtp({
      email: body.email,
      token: body.token,
      type: "email",
    });
    if (error)
      return result(
        { error: "The code is invalid or expired. Request a new code." },
        400,
      );
    return result({ ok: true });
  } catch {
    return result({ error: "Check your sign-in details and try again." }, 400);
  }
}
