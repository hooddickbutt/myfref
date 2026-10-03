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
        setError(data.error || "Could not create the card.");
        return;
      }
      setCard(data.card);
      setNote(data.note || "");
      rememberHandle(data.card.handle);
    } catch {
      setError("The network stalled. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <p className="text-xs tracking-[0.22em] text-mint uppercase">X handle</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          Cut a card from a public profile
        </h1>
        <p className="mt-4 max-w-xl text-cream/75">
          No password. A handle pulls the name and profile photo from the public API. Join bonus{" "}
          {formatNumber(JOIN_BONUS)} sparks
          {ref.trim() ? `, plus ${formatNumber(INVITEE_BONUS)} if a referral is set` : ""}.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">X handle</span>
            <Input
              value={handle}
              onValueChange={(value) => setHandle(value.replace(/^@+/, ""))}
              placeholder="Your X handle"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 rounded-2xl border-gold/25 bg-white/5 px-4 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-cream/70">Referral handle, if you have one</span>
            <Input
              value={ref}
              onValueChange={(value) => setRef(value.replace(/^@+/, ""))}
              placeholder="Handle that sent you the link"
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
            {loading ? "Fetching profile…" : "Create card"}
          </Button>
        </form>

        {note ? <p className="mt-6 text-mint">{note}</p> : null}
        {card ? (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href={`/card/${card.handle}`} className="text-gold underline-offset-4 hover:underline">
              Open card page
            </Link>
            <button
              type="button"
              className="text-cream/80 underline-offset-4 hover:underline"
              onClick={() =>
                navigator.clipboard.writeText(`${window.location.origin}/join?ref=${card.handle}`)
              }
            >
              Copy referral link
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
              <p className="font-display text-2xl text-gold">Empty frame</p>
              <p className="mt-2 text-sm">Enter a handle and the card appears here, with the X photo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
