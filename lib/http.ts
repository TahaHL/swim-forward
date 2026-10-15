import { z } from "zod";
export function result(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function input<T>(request: Request, schema: z.ZodType<T>) {
  const expected = process.env.APP_URL;
  if (!expected || request.headers.get("origin") !== new URL(expected).origin)
    throw new Error("origin");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("input");
  const body = await request.text();
  if (body.length > 64000) throw new Error("input");
  return schema.parse(JSON.parse(body));
}
