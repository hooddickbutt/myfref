"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { JACKPOT_PAYOUT } from "@/lib/economy";
import { formatNumber, formatPercent, formatWhen } from "@/lib/format";
import { useMyHandle } from "@/lib/use-my-handle";
import type { PublicCard, PublicDraw } from "@/lib/types";

type Entrant = PublicCard & { chance: number };

type Board = {
  pool: number;
  holderCount: number;
  nextDrawAt: number;
  minHolders: number;
  draws: PublicDraw[];
  entrants: Entrant[];
};

const ROW = 84;

export function JackpotPanel() {
  const reduce = useReducedMotion();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [phase, setPhase] = useState<"idle" | "request" | "spinning" | "revealed">("idle");
  const [spin, setSpin] = useState<{ id: number; winner: string; prize: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const mine = useMyHandle();

  async function load() {
    try {
      const response = await fetch("/api/jackpot", { cache: "no-store" });
      const data = (await response.json()) as Board & { ok: boolean; error?: string };
      if (!data.ok) {
        setLoadError(data.error || "জ্যাকপট আনা যায়নি।");
        return;
      }
      setBoard(data);
      setLoadError("");
    } catch {
      setLoadError("জ্যাকপট আনা যায়নি।");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    const clock = window.setInterval(() => setNow(Date.now()), 500);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, []);

  const cooling = board ? Math.max(0, board.nextDrawAt - now) : 0;
  const mineCard = board?.entrants.find((card) => card.handle === mine);

  async function draw() {
    setError("");
    setPhase("request");
    try {
      const response = await fetch("/api/jackpot", { method: "POST" });
      const data = (await response.json()) as Board & {
        ok: boolean;
        error?: string;
        draw?: PublicDraw;
      };
      if (!data.ok || !data.draw) {
        setError(data.error || "এবার ঘোরানো যায়নি।");
        setPhase("idle");
        return;
      }
      setBoard(data);
      if (reduce) {
        setSpin({ id: Date.now(), winner: data.draw.winnerHandle, prize: data.draw.prize });
        setPhase("revealed");
        return;
      }
      setPhase("spinning");
      setSpin({ id: Date.now(), winner: data.draw.winnerHandle, prize: data.draw.prize });
    } catch {
      setError("নেটওয়ার্ক আটকেছে।");
      setPhase("idle");
    }
  }

  const winner = board?.entrants.find((card) => card.handle === spin?.winner);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <p className="text-xs tracking-[0.22em] text-rose uppercase">জ্যাকপট</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          টিকিট যার বেশি, নাম ওঠার সুযোগ তার বেশি
        </h1>
        <p className="mt-4 max-w-xl text-cream/75">
          প্রতিটি জয়েনে পুল বাড়ে। ড্র হলে পুলের {formatPercent(JACKPOT_PAYOUT)} স্পার্ক একজন
          হোল্ডারের কার্ডে যায়। বিরল কার্ড আর রেফারে টিকিট বাড়ে।
        </p>

        <div className="mt-8 rounded-[28px] border border-gold/25 bg-white/5 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-cream/60">প্রাইজ পুল</p>
              <p className="font-mono text-5xl text-gold">{formatNumber(board?.pool ?? 0)}</p>
            </div>
            <div className="text-sm text-cream/70">
              <p>হোল্ডার {formatNumber(board?.holderCount ?? 0)}</p>
              {mineCard ? (
                <p className="text-mint">
                  তোমার টিকিট {formatNumber(mineCard.tickets)} · সুযোগ {formatPercent(mineCard.chance)}
                </p>
              ) : (
                <p>কার্ড কাটলে এখানে তোমার সুযোগ দেখাবে।</p>
              )}
            </div>
          </div>

          <Reel
            entrants={board?.entrants ?? []}
            spinId={spin?.id ?? 0}
            winner={phase === "idle" ? "" : spin?.winner ?? ""}
            spinning={phase === "spinning"}
            onDone={() => setPhase("revealed")}
          />

          {phase === "revealed" && winner && spin ? (
            <p className="mt-4 text-center text-lg">
              <span className="text-gold">{winner.name}</span> পেয়েছে {formatNumber(spin.prize)} স্পার্ক
            </p>
          ) : null}
          {error ? <p className="mt-4 text-center text-sm text-rose">{error}</p> : null}
          {loadError ? <p className="mt-4 text-center text-sm text-rose">{loadError}</p> : null}

          <div className="mt-5 flex justify-center">
            <Button
              type="button"
              onClick={draw}
              disabled={phase === "request" || phase === "spinning" || cooling > 0 || !board}
              className="h-12 rounded-full px-6 text-base"
            >
              {phase === "request" || phase === "spinning"
                ? "ঘুরছে…"
                : cooling > 0
                  ? `${formatNumber(Math.ceil(cooling / 1000))} সেকেন্ড পর আবার`
                  : "চাকা ঘোরাও"}
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-cream/45">
            রাউন্ডের মাঝে অল্প বিরতি, যাতে একই মুহূর্তে বারবার না ঘোরে। অন্তত দুইজন হোল্ডার লাগবে।
          </p>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg">টিকিট বোর্ড</h2>
          <ul className="mt-3 space-y-2">
            {(board?.entrants ?? []).slice(0, 8).map((card) => (
              <li key={card.handle} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">
                  {card.name}
                  <span className="text-cream/45"> · {card.rarityLabel}</span>
                </span>
                <span className="font-mono text-mint">{formatPercent(card.chance)}</span>
              </li>
            ))}
            {board && board.entrants.length === 0 ? (
              <li className="text-sm text-cream/55">এখনো কেউ নেই। দুইজন জয়েন করলে চাকা চলবে।</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg">আগের জয়</h2>
          <ul className="mt-3 space-y-3">
            {(board?.draws ?? []).map((draw) => (
              <li key={draw.id} className="text-sm">
                <p>
                  {draw.winnerName} · {formatNumber(draw.prize)} স্পার্ক
                </p>
                <p className="text-cream/45">{formatWhen(draw.at)}</p>
              </li>
            ))}
            {board && board.draws.length === 0 ? (
              <li className="text-sm text-cream/55">এখনো কোনো ড্র হয়নি।</li>
            ) : null}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Reel({
  entrants,
  spinId,
  winner,
  spinning,
  onDone,
}: {
  entrants: Entrant[];
  spinId: number;
  winner: string;
  spinning: boolean;
  onDone: () => void;
}) {
  const rows = entrants.length > 0 ? entrants : placeholderRows();
  const repeats = 8;
  const winnerIndex = Math.max(
    0,
    rows.findIndex((row) => row.handle === winner),
  );
  const strip = Array.from({ length: repeats }, () => rows).flat();
  const landing = winner ? (repeats - 2) * rows.length + winnerIndex : 0;

  return (
    <div className="relative mx-auto mt-6 h-[84px] max-w-md overflow-hidden rounded-2xl border border-gold/30 bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-[72px] -translate-y-1/2 rounded-xl border border-gold/50" />
      {spinning ? (
        <motion.div
          key={spinId}
          initial={{ y: 0 }}
          animate={{ y: -landing * ROW }}
          transition={{ duration: 3.2, ease: [0.12, 0.7, 0.12, 1] }}
          onAnimationComplete={onDone}
        >
          {strip.map((row, index) => (
            <ReelRow key={`${row.handle}-${index}`} row={row} />
          ))}
        </motion.div>
      ) : (
        <ReelRow row={winner ? rows[winnerIndex] : rows[0]} />
      )}
    </div>
  );
}

function ReelRow({ row }: { row: Entrant }) {
  return (
    <div className="flex h-[84px] items-center gap-3 px-5">
      <Avatar src={row.avatar} name={row.name} className="size-11 shrink-0 rounded-full" />
      <span className="min-w-0">
        <span className="block truncate">{row.name}</span>
        <span className="block text-xs text-cream/50">
          @{row.displayHandle} · টিকিট {formatNumber(row.tickets)}
        </span>
      </span>
    </div>
  );
}

function placeholderRows(): Entrant[] {
  return [
    {
      handle: "waiting",
      displayHandle: "halo",
      name: "হোল্ডারের অপেক্ষায়",
      avatar: null,
      bio: "",
      followers: 0,
      serial: 0,
      rarity: "common",
      rarityLabel: "সাধারণ",
      sparks: 0,
      holdSparks: 0,
      baseSparks: 0,
      holdPerUnit: 1,
      referrals: 0,
      invited: [],
      tickets: 0,
      referredBy: null,
      createdAt: 0,
      milestonesClaimed: [],
      chance: 0,
    },
  ];
}
