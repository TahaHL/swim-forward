import { GET as records } from "../data/route";
export async function GET() {
  const response = await records();
  if (!response.ok) return response;
  response.headers.set(
    "Content-Disposition",
    'attachment; filename="swim-forward-records.json"',
  );
  return response;
}
