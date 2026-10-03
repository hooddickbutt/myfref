import { errorResponse } from "@/lib/errors";
import { drawJackpot, getJackpotState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getJackpotState();
    return Response.json({ ok: true, ...state });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST() {
  try {
    const state = await drawJackpot();
    return Response.json({ ok: true, ...state });
  } catch (error) {
    return errorResponse(error);
  }
}
