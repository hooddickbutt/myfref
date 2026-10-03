"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatNumber, formatSerial } from "@/lib/format";
import type { PublicCard } from "@/lib/types";

const sorts = [
  { id: "sparks", label: "স্পার্ক" },
  { id: "referrals", label: "রেফার" },
  { id: "new", label: "নতুন" },
] as const;

export function BoardList({ cards }: { cards: PublicCard[] }) {
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("sparks");
  const rows = [...cards].sort((a, b) => {
    if (sort === "referrals") return b.referrals - a.referrals || b.sparks - a.sparks;
    if (sort === "new") return b.createdAt - a.createdAt;
    return b.sparks - a.sparks;
  });

  if (cards.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-gold/30 px-6 py-16 text-center">
        <p className="font-display text-3xl">বোর্ড ফাঁকা</p>
        <p className="mt-2 text-cream/65">প্রথম কার্ড কাটলে নাম এখানে উঠবে।</p>
        <Link href="/join" className="mt-6 inline-flex text-gold">
          জয়েন করো
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        {sorts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSort(item.id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              sort === item.id ? "bg-gold text-ink" : "border border-white/15 text-cream/75"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ol className="mt-6 space-y-2">
        {rows.map((card, index) => (
          <li key={card.handle}>
            <Link
              href={`/card/${card.handle}`}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 hover:border-gold/40"
            >
              <span className="w-8 font-mono text-sm text-cream/45">{formatNumber(index + 1)}</span>
              <Avatar src={card.avatar} name={card.name} className="size-11 rounded-full" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{card.name}</span>
                <span className="block text-xs text-cream/50">
                  @{card.displayHandle} · #{formatSerial(card.serial)}
                </span>
              </span>
              <Badge variant="outline" className="hidden border-gold/30 text-gold sm:inline-flex">
                {card.rarityLabel}
              </Badge>
              <span className="text-right text-sm">
                <span className="block font-mono text-gold">{formatNumber(card.sparks)}</span>
                <span className="block text-xs text-cream/45">
                  রেফার {formatNumber(card.referrals)} · {formatCompact(card.followers)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
