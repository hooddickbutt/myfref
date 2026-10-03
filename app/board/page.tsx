import { BoardList } from "@/components/board-list";
import { listCards } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Board",
};

export default async function BoardPage() {
  const cards = await listCards();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs tracking-[0.22em] text-gold uppercase">Holders</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Card board</h1>
      <p className="mt-3 max-w-xl text-cream/70">
        Sort by sparks, referrals, or newest cards. Open a name to see the card.
      </p>
      <div className="mt-8">
        <BoardList cards={cards} />
      </div>
    </div>
  );
}
