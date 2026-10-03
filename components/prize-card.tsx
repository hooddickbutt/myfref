"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { RARITIES, TOKEN } from "@/lib/economy";
import { formatNumber, formatSerial } from "@/lib/format";
import type { PublicCard } from "@/lib/types";

function hueFromHandle(handle: string) {
  return [...handle].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;
}

function Monogram({ name, handle }: { name: string; handle: string }) {
  const hue = hueFromHandle(handle);
  const letter = (name || handle).trim().slice(0, 1) || "H";
  return (
    <div
      className="grid size-full place-items-center text-4xl font-semibold text-white"
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 62% 42%), hsl(${(hue + 36) % 360} 70% 28%))`,
      }}
    >
      {letter}
    </div>
  );
}

export function PrizeCard({
  card,
  tilt = true,
}: {
  card: PublicCard;
  tilt?: boolean;
}) {
  const frame = useRef<HTMLElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 18, rx: 8, ry: -10 });
  const rarity = RARITIES[card.rarity];

  function onMove(event: React.MouseEvent<HTMLElement>) {
    if (!tilt || !frame.current) return;
    const box = frame.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    setSpot({
      x: px * 100,
      y: py * 100,
      rx: (0.5 - py) * 12,
      ry: (px - 0.5) * 14,
    });
  }

  return (
    <article
      ref={frame}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot({ x: 50, y: 18, rx: 8, ry: -10 })}
      className="relative aspect-[3/4.15] w-[280px] overflow-hidden rounded-[28px] sm:w-[320px]"
      style={{
        transform: `perspective(900px) rotateX(${spot.rx}deg) rotateY(${spot.ry}deg)`,
        transition: "transform 180ms ease",
        background:
          "linear-gradient(165deg, rgba(255,244,220,0.14), rgba(12,12,16,0.2) 28%, rgba(8,9,12,0.1)), linear-gradient(180deg, #1a1712 0%, #0d0f14 48%, #12151c 100%)",
        boxShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(240,195,106,0.28), 0 0 42px ${rarity.glow}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.42), transparent 26%), linear-gradient(118deg, transparent 18%, ${rarity.glow} 36%, transparent 48%, rgba(142,240,192,0.35) 64%, transparent 78%)`,
        }}
      />
      <div className="pointer-events-none absolute -left-8 top-16 w-40 rotate-[-18deg] font-display text-6xl tracking-tight text-white/5">
        {TOKEN.name}
      </div>
      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm tracking-[0.22em] text-gold">{TOKEN.name}</p>
            <p className="mt-1 text-xs" style={{ color: rarity.ink }}>
              {rarity.label}
              {card.sample ? " · Sample" : ""}
            </p>
          </div>
          <p className="font-mono text-xs text-cream/70">#{formatSerial(card.serial)}</p>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center">
          <div className="relative size-32">
            <div
              className="spin-slow absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 40deg, transparent, ${rarity.ink}, transparent 40%, ${rarity.ink}, transparent 75%)`,
              }}
            />
            <div className="absolute inset-[3px] overflow-hidden rounded-full bg-ink">
              {card.avatar ? (
                <Avatar src={card.avatar} name={card.name} className="size-full" />
              ) : (
                <Monogram name={card.name} handle={card.handle} />
              )}
            </div>
          </div>
          <h3 className="mt-5 max-w-full truncate text-center text-2xl font-semibold">
            {card.name}
          </h3>
          <p className="text-sm text-cream/65">@{card.displayHandle}</p>
        </div>

        <div className="mt-4 border-t border-dashed border-gold/35 pt-4">
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div>
              <dt className="text-[11px] text-cream/55">Sparks</dt>
              <dd className="font-mono text-lg text-gold">{formatNumber(card.sparks)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-cream/55">Referrals</dt>
              <dd className="font-mono text-lg">{formatNumber(card.referrals)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-cream/55">Tickets</dt>
              <dd className="font-mono text-lg text-mint">{formatNumber(card.tickets)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-center text-[11px] tracking-[0.16em] text-cream/45">
            Holder card
          </p>
        </div>
      </div>
    </article>
  );
}
