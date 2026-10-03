import Link from "next/link";
import { CardScreen } from "@/components/card-screen";
import { getHolder, normalizeHandle } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const normalized = normalizeHandle(handle);
  const card = normalized ? await getHolder(normalized) : null;

  if (!card) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-4xl">No card here</h1>
        <p className="mt-3 text-cream/70">
          @{handle} is not a holder yet, or the handle is not valid.
        </p>
        <Link href="/join" className="mt-6 inline-flex text-gold">
          Cut a card
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <CardScreen card={card} />
    </div>
  );
}
