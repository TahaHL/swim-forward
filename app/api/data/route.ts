import { database, identity } from "@/lib/supabase/server";
import { result } from "@/lib/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await identity();
    if (!user) return result({ error: "Sign in to view your records." }, 401);
    const db = await database();
    const names = [
      "swimmers",
      "programmes",
      "blocks",
      "venues",
      "sessions",
      "skills",
      "swimmer_skills",
      "updates",
      "assessments",
      "enrolments",
      "notifications",
      "bookings",
      "consents",
    ] as const;
    const values = await Promise.all(
      names.map(async (name) => {
        const rows: Record<string, unknown>[] = [];
        for (let offset = 0; ; offset += 1000) {
          let query = db.from(name).select("*");
          if (name === "enrolments")
            query = query.order("block_id").order("swimmer_id");
          else if (name === "swimmer_skills")
            query = query.order("swimmer_id").order("skill_id");
          else query = query.order(name === "assessments" ? "sequence" : "id");
          const page = await query.range(offset, offset + 999);
          if (page.error) return { data: null, error: page.error };
          rows.push(...(page.data ?? []));
          if ((page.data?.length ?? 0) < 1000)
            return { data: rows, error: null };
        }
      }),
    );
    if (values.some((value) => value.error))
      return result({ error: "Records could not be loaded. Try again." }, 503);
    return result({
      user,
      ...Object.fromEntries(
        names.map((name, index) => [name, values[index].data]),
      ),
    });
  } catch {
    return result({ error: "Records are unavailable. Try again later." }, 503);
  }
}
