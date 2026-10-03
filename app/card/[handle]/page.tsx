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
        <h1 className="font-display text-4xl">এই কার্ড নেই</h1>
        <p className="mt-3 text-cream/70">
          @{handle} এখনো হোল্ডার নয়, অথবা আইডিটা ঠিক নয়।
        </p>
        <Link href="/join" className="mt-6 inline-flex text-gold">
          কার্ড কাটো
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
