"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HOLD_UNIT_LABEL,
  INVITEE_BONUS,
  JOIN_BONUS,
  MILESTONES,
  RARITIES,
  REFERRER_BONUS,
  nextMilestone,
} from "@/lib/economy";
import { formatNumber } from "@/lib/format";
import { useMyHandle } from "@/lib/use-my-handle";
import type { PublicCard, Rarity } from "@/lib/types";

const rarityIds = Object.keys(RARITIES) as Rarity[];

export function RewardsDesk() {
  const [people, setPeople] = useState(5);
  const [minutes, setMinutes] = useState(60);
  const [rarity, setRarity] = useState<Rarity>("rare");
  const [mine, setMine] = useState<PublicCard | null>(null);
  const myHandle = useMyHandle();

  useEffect(() => {
    if (!myHandle) return;
    let cancelled = false;
    void (async () => {
      const response = await fetch(`/api/card/${myHandle}`, { cache: "no-store" });
      const data = (await response.json()) as { ok: boolean; card?: PublicCard };
      if (!cancelled && data.ok && data.card) setMine(data.card);
    })();
    return () => {
      cancelled = true;
    };
  }, [myHandle]);

  const estimate = useMemo(() => {
    const hold = minutes * RARITIES[rarity].holdPerUnit;
    const referrals = people * REFERRER_BONUS;
    const milestones = MILESTONES.filter((item) => people >= item.count).reduce(
      (sum, item) => sum + item.bonus,
      0,
    );
    return {
      hold,
      referrals,
      milestones,
      total: JOIN_BONUS + hold + referrals + milestones,
    };
  }, [minutes, people, rarity]);

  const upcoming = mine ? nextMilestone(mine.milestonesClaimed) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <p className="text-xs tracking-[0.22em] text-mint uppercase">স্পার্ক</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          হোল্ড, রেফার, ইনভাইট — তিনটা আলাদা হিসাব
        </h1>
        <div className="mt-8 space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl">হোল্ড</h2>
            <p className="mt-2 text-cream/70">
              কার্ড কাটার পর থেকে সময় ধরে স্পার্ক জমে। রেট কার্ডের বিরলতার ওপর। এটা সাইটের পয়েন্ট,
              ওয়ালেট থেকে কাটা হয় না।
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl">রেফার</h2>
            <p className="mt-2 text-cream/70">
              তোমার লিংক: <span className="text-gold">/join?ref=তোমারআইডি</span>। নতুন জন এলে তুমি{" "}
              {formatNumber(REFERRER_BONUS)}, সে {formatNumber(INVITEE_BONUS)}। নিজের লিংকে নিজে
              জয়েন হয় না।
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-2xl">ইনভাইট মাইলস্টোন</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {MILESTONES.map((milestone) => {
                const done = mine?.milestonesClaimed.includes(milestone.count);
                return (
                  <li key={milestone.count} className="flex items-center justify-between gap-3">
                    <span>
                      {milestone.title}
                      {done ? " · পেয়ে গেছ" : ""}
                    </span>
                    <span className="font-mono text-gold">{formatNumber(milestone.bonus)}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        </div>

        <div className="mt-8 rounded-[28px] border border-gold/25 p-5">
          <h2 className="text-2xl">হিসাব কষে দেখো</h2>
          <label className="mt-4 block text-sm text-cream/70">
            কতজন আনবে: {formatNumber(people)}
            <input
              type="range"
              min={0}
              max={30}
              value={people}
              onChange={(event) => setPeople(Number(event.target.value))}
              className="mt-2 w-full accent-gold"
            />
          </label>
          <label className="mt-4 block text-sm text-cream/70">
            কত {HOLD_UNIT_LABEL} হোল্ড: {formatNumber(minutes)}
            <input
              type="range"
              min={0}
              max={240}
              value={minutes}
              onChange={(event) => setMinutes(Number(event.target.value))}
              className="mt-2 w-full accent-gold"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {rarityIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setRarity(id)}
                className={`rounded-full px-3 py-1 text-sm ${
                  rarity === id ? "bg-gold text-ink" : "border border-white/15"
                }`}
              >
                {RARITIES[id].bn}
              </button>
            ))}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-cream/50">হোল্ড</dt>
              <dd className="font-mono text-lg">{formatNumber(estimate.hold)}</dd>
            </div>
            <div>
              <dt className="text-cream/50">রেফার</dt>
              <dd className="font-mono text-lg">{formatNumber(estimate.referrals)}</dd>
            </div>
            <div>
              <dt className="text-cream/50">মাইলস্টোন</dt>
              <dd className="font-mono text-lg">{formatNumber(estimate.milestones)}</dd>
            </div>
            <div>
              <dt className="text-cream/50">মোট</dt>
              <dd className="font-mono text-lg text-gold">{formatNumber(estimate.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-cream/45">জয়েন বোনাস {formatNumber(JOIN_BONUS)} ধরা আছে।</p>
        </div>
      </section>

      <aside className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl">তোমার কার্ড</h2>
        {mine ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-2xl">{mine.name}</p>
            <p className="text-cream/60">
              @{mine.displayHandle} · {mine.rarityLabel}
            </p>
            <p>
              মোট স্পার্ক <span className="font-mono text-gold">{formatNumber(mine.sparks)}</span>
            </p>
            <p className="text-cream/70">
              এর মধ্যে হোল্ড {formatNumber(mine.holdSparks)}, বাকি জয়েন-রেফার-জ্যাকপট।
            </p>
            <p>
              রেফার {formatNumber(mine.referrals)} · টিকিট {formatNumber(mine.tickets)} ·{" "}
              {formatNumber(mine.holdPerUnit)} / {HOLD_UNIT_LABEL}
            </p>
            {upcoming ? (
              <p className="text-mint">
                পরের ধাপ: {upcoming.title} ({formatNumber(mine.referrals)}/
                {formatNumber(upcoming.count)})
              </p>
            ) : (
              <p className="text-mint">সব ইনভাইট ধাপ পূরণ।</p>
            )}
            <Button
              render={<Link href={`/card/${mine.handle}`} />}
              className="mt-2 h-11 rounded-full px-5"
              nativeButton={false}
            >
              কার্ড খোলো
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-cream/70">এই ব্রাউজারে এখনো কোনো কার্ড সেভ নেই।</p>
            <Button
              render={<Link href="/join" />}
              className="mt-4 h-11 rounded-full px-5"
              nativeButton={false}
            >
              জয়েন করো
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}
