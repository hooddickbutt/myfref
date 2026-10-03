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
    { ok: false as const, error: "Something went wrong. Try again." },
    { status: 500 },
  );
}
