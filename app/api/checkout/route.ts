import { result } from "@/lib/http";
// Deliberately unavailable until the owner enables the future commercial release.
export async function POST() {
  return result(
    {
      error:
        "Online booking and pricing are coming later. Contact your coach about joining a block.",
    },
    410,
  );
}
