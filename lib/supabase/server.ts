import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export async function database() {
  if (!configured()) throw new Error("Database configuration is required.");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server rendering cannot write cookies; proxy refreshes them. */
          }
        },
      },
    },
  );
}

export async function identity() {
  if (!configured()) return null;
  const db = await database();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: profile } = await db
    .from("profiles")
    .select("id,display_name,disabled_at")
    .eq("id", user.id)
    .single();
  if (!profile || profile.disabled_at) return null;
  const { data: roles } = await db
    .from("memberships")
    .select("organisation_id,role")
    .eq("user_id", user.id);
  return {
    id: user.id,
    email: user.email ?? "",
    name: profile.display_name as string,
    roles: roles ?? [],
  };
}
