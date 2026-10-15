import SignIn from "@/components/sign-in";
import { Brand } from "@/components/core";
import { configured } from "@/lib/supabase/server";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <>
      <header className="public-header">
        <Brand />
      </header>
      <main id="main" className="auth-page">
        <SignIn enabled={configured()} />
        <Link href="/demo">View the demonstration</Link>
      </main>
    </>
  );
}
