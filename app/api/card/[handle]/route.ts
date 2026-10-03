import { errorResponse } from "@/lib/errors";
import { getHolder, normalizeHandle, refreshHolder } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ handle: string }> }) {
  const { handle } = await context.params;
  const normalized = normalizeHandle(handle);
  if (!normalized) {
    return Response.json({ ok: false, error: "আইডি ঠিক নেই।" }, { status: 400 });
  }
  const card = await getHolder(normalized);
  if (!card) {
    return Response.json({ ok: false, error: "এই কার্ড এখনো কাটা হয়নি।" }, { status: 404 });
  }
  return Response.json({ ok: true, card });
}

export async function POST(_request: Request, context: { params: Promise<{ handle: string }> }) {
  try {
    const { handle } = await context.params;
    const card = await refreshHolder(handle);
    return Response.json({ ok: true, card });
  } catch (error) {
    return errorResponse(error);
  }
}
