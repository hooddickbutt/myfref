"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrizeCard } from "@/components/prize-card";
import { Button } from "@/components/ui/button";
import { HOLD_UNIT_LABEL, MILESTONES, nextMilestone } from "@/lib/economy";
import { formatCompact, formatNumber, formatWhen } from "@/lib/format";
import { useMyHandle } from "@/lib/use-my-handle";
import type { PublicCard } from "@/lib/types";

export function CardScreen({ card }: { card: PublicCard }) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const mine = useMyHandle();
  const upcoming = nextMilestone(card.milestonesClaimed);
  const referralPath = `/join?ref=${card.handle}`;

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  function copyReferral() {
    void copy(`${window.location.origin}${referralPath}`, "লিংক কপি হয়েছে");
  }

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch(`/api/card/${card.handle}`, { method: "POST" });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "আপডেট হয়নি।");
        return;
      }
      router.refresh();
    } catch {
      setError("আপডেট হয়নি।");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="flex justify-center lg:justify-start">
        <PrizeCard card={card} />
      </div>
      <div>
        <p className="text-xs tracking-[0.2em] text-gold uppercase">{card.rarityLabel}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{card.name}</h1>
        <p className="mt-2 text-cream/65">@{card.displayHandle}</p>
        {card.bio ? <p className="mt-4 max-w-xl text-cream/80">{card.bio}</p> : null}
        <p className="mt-3 text-sm text-cream/55">
          ফলোয়ার {formatCompact(card.followers)} · কার্ড {formatWhen(card.createdAt)}
          {card.referredBy ? ` · রেফার @${card.referredBy}` : ""}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["মোট স্পার্ক", formatNumber(card.sparks)],
            ["হোল্ড থেকে", formatNumber(card.holdSparks)],
            ["রেফার", formatNumber(card.referrals)],
            ["টিকিট", formatNumber(card.tickets)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <dt className="text-xs text-cream/50">{label}</dt>
              <dd className="mt-1 font-mono text-xl text-gold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-cream/60">
          হোল্ড রেট {formatNumber(card.holdPerUnit)} স্পার্ক / {HOLD_UNIT_LABEL}
        </p>

        <div className="mt-6 rounded-3xl border border-gold/20 p-4">
          <p className="text-sm text-cream/60">রেফার লিংক</p>
          <p className="mt-1 break-all font-mono text-sm">{referralPath}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-10 rounded-full px-4"
              onClick={copyReferral}
            >
              লিংক কপি
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-gold/30 px-4 text-gold"
              onClick={() => copy(window.location.href, "কার্ড লিংক কপি হয়েছে")}
            >
              কার্ড লিংক
            </Button>
            {mine === card.handle ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-full px-4"
                disabled={refreshing}
                onClick={refresh}
              >
                {refreshing ? "আনছি…" : "ছবি আপডেট"}
              </Button>
            ) : null}
          </div>
          {copied ? <p className="mt-2 text-sm text-mint">{copied}</p> : null}
          {error ? <p className="mt-2 text-sm text-rose">{error}</p> : null}
        </div>

        <div className="mt-6">
          <h2 className="text-xl">ইনভাইট ধাপ</h2>
          <ul className="mt-3 space-y-3">
            {MILESTONES.map((milestone) => {
              const done = card.milestonesClaimed.includes(milestone.count);
              const width = Math.min(100, (card.referrals / milestone.count) * 100);
              return (
                <li key={milestone.count}>
                  <div className="flex justify-between text-sm">
                    <span>
                      {milestone.title}
                      {done ? " · পেয়েছে" : ""}
                    </span>
                    <span className="font-mono text-gold">{formatNumber(milestone.bonus)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-mint" style={{ width: `${width}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {upcoming ? (
            <p className="mt-3 text-sm text-cream/60">
              পরের ধাপ {upcoming.title}: {formatNumber(card.referrals)}/
              {formatNumber(upcoming.count)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-mint">সব ধাপ পূরণ।</p>
          )}
        </div>

        {card.invited.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl">যারা এই লিংকে এসেছে</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {card.invited.map((handle) => (
                <li key={handle}>
                  <Link href={`/card/${handle}`} className="text-sm text-gold">
                    @{handle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
