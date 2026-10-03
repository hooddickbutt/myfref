import { errorResponse } from "@/lib/errors";
import { joinHolder } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      handle?: unknown;
      ref?: unknown;
    } | null;
    if (!body || typeof body.handle !== "string") {
      return Response.json({ ok: false, error: "Enter an X handle." }, { status: 400 });
    }
    const ref = typeof body.ref === "string" ? body.ref : "";
    const result = await joinHolder(body.handle, ref);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}
