import "server-only";
import { createClient } from "@supabase/supabase-js";
/** Only for provider-authenticated background work. Never use for ordinary user reads. */
export function serviceDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Error("Service configuration required");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
