"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PrizeCard } from "@/components/prize-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INVITEE_BONUS, JOIN_BONUS } from "@/lib/economy";
import { formatNumber } from "@/lib/format";
import { rememberHandle } from "@/lib/session";
import type { PublicCard } from "@/lib/types";

export function JoinPanel() {
  const params = useSearchParams();
  const initialRef = params.get("ref") ?? "";
  const [handle, setHandle] = useState("");
  const [ref, setRef] = useState(initialRef.replace(/^@+/, ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [card, setCard] = useState<PublicCard | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNote("");
    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle, ref }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        note?: string;
        card?: PublicCard;
      };
      if (!data.ok || !data.card) {
        setError(data.error || "কার্ড কাটা যায়নি।");
        return;
      }
      setCard(data.card);
      setNote(data.note || "");
      rememberHandle(data.card.handle);
    } catch {
      setError("নেটওয়ার্ক আটকেছে। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-xs tracking-[0.22em] text-mint uppercase">এক্স আইডি</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          পাবলিক প্রোফাইল দিয়ে কার্ড কাটো
        </h1>
        <p className="mt-4 max-w-xl text-cream/75">
          পাসওয়ার্ড লাগবে না। আইডি দিলে পাবলিক এপিআই থেকে নাম আর প্রোফাইল ছবি এসে কার্ডে বসবে।
          জয়েন বোনাস {formatNumber(JOIN_BONUS)} স্পার্ক
          {ref.trim() ? `, রেফার থাকলে আরও ${formatNumber(INVITEE_BONUS)}` : ""}।
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">এক্স আইডি</span>
            <Input
              value={handle}
              onValueChange={(value) => setHandle(value.replace(/^@+/, ""))}
              placeholder="তোমার এক্স আইডি"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 rounded-2xl border-gold/25 bg-white/5 px-4 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">রেফার আইডি, থাকলে</span>
            <Input
              value={ref}
              onValueChange={(value) => setRef(value.replace(/^@+/, ""))}
              placeholder="যে আইডি থেকে লিংক পেয়েছ"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 rounded-2xl border-gold/25 bg-white/5 px-4 text-base"
            />
          </label>
          {error ? (
            <p className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={loading || handle.trim().length === 0}
            className="h-12 rounded-full px-6 text-base"
          >
            {loading ? "প্রোফাইল আনছি…" : "কার্ড তৈরি করো"}
          </Button>
        </form>

        {note ? <p className="mt-6 text-mint">{note}</p> : null}
        {card ? (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href={`/card/${card.handle}`} className="text-gold underline-offset-4 hover:underline">
              কার্ড পেজ খোলো
            </Link>
            <button
              type="button"
              className="text-cream/80 underline-offset-4 hover:underline"
              onClick={() =>
                navigator.clipboard.writeText(`${window.location.origin}/join?ref=${card.handle}`)
              }
            >
              রেফার লিংক কপি
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center lg:justify-end">
        {card ? (
          <PrizeCard card={card} />
        ) : (
          <div className="grid aspect-[3/4.15] w-[280px] place-items-center rounded-[28px] border border-dashed border-gold/30 bg-white/5 p-6 text-center text-cream/60 sm:w-[320px]">
            <div>
              <p className="font-display text-2xl text-gold">খালি ফ্রেম</p>
              <p className="mt-2 text-sm">আইডি দিলে এখানেই কার্ড ফুটে উঠবে, এক্সের ছবিসহ।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
