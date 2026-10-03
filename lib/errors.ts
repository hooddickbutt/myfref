export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof GameError) {
    return Response.json({ ok: false as const, error: error.message }, { status: 400 });
  }
  console.error(error);
  return Response.json(
    { ok: false as const, error: "সার্ভারে সমস্যা হয়েছে। আবার চেষ্টা করো।" },
    { status: 500 },
  );
}
