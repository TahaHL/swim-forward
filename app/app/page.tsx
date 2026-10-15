import { redirect } from "next/navigation";
import { identity } from "@/lib/supabase/server";
import Workspace from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function App() {
  if (!(await identity())) redirect("/sign-in");
  return <Workspace />;
}
