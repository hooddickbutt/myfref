"use client";

import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { PrizeCard } from "@/components/prize-card";
import { Button } from "@/components/ui/button";
import {
  HOLD_UNIT_LABEL,
  INVITEE_BONUS,
  JOIN_BONUS,
  MILESTONES,
  POOL_PER_JOIN,
  RARITIES,
  REFERRER_BONUS,
  TOKEN,
} from "@/lib/economy";
import { formatCompact, formatNumber } from "@/lib/format";
import { sampleCards } from "@/lib/samples";
import { pump } from "@/lib/token";
import type { HomeStats, PublicCard } from "@/lib/types";

export function HomeView({ stats }: { stats: HomeStats }) {
  const real = stats.latest;
  const usingSamples = real.length === 0;
  const center = real[0] ?? sampleCards[0];
  const left = real[1] ?? (usingSamples ? sampleCards[1] : undefined);
  const right = real[2] ?? (usingSamples ? sampleCards[2] : undefined);

  return (
    <div>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-12 pb-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:pt-16">
        <div>
          <p className="text-xs tracking-[0.24em] text-mint uppercase">pump.fun · {TOKEN.ticker}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] sm:text-7xl">
            Join with X.
            <span className="mt-1 block text-gold">Leave with a card.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/75">
            Your public profile photo lands on a prize card. Hold to earn sparks, invite people for
            bonuses, and hit the jackpot when your name comes up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/join" />}
              className="h-12 rounded-full px-6 text-base"
              nativeButton={false}
            >
              Cut your card
            </Button>
            <Button
              variant="outline"
              render={<Link href="/jackpot" />}
              className="h-12 rounded-full border-gold/40 px-6 text-base text-gold"
              nativeButton={false}
            >
              See the jackpot
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <Stat label="Holders" value={stats.holders} />
            <Stat label="Prize pool" value={stats.pool} />
            <div>
              <dt className="text-xs text-cream/50">Last win</dt>
              <dd className="mt-1 truncate text-sm">
                {stats.lastDraw ? stats.lastDraw.winnerName : "None yet"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto h-[460px] w-full max-w-[420px]">
          {left ? (
            <div className="absolute top-10 left-0 hidden -rotate-6 opacity-80 sm:block">
              <div className="scale-[0.78] origin-top-left">
                <PrizeCard card={left} tilt={false} />
              </div>
            </div>
          ) : null}
          {right ? (
            <div className="absolute top-10 right-0 hidden rotate-6 opacity-80 sm:block">
              <div className="scale-[0.78] origin-top-right">
                <PrizeCard card={right} tilt={false} />
              </div>
            </div>
          ) : null}
          <div className="relative z-10 mx-auto w-fit float-card">
            {center.sample ? (
              <PrizeCard card={center} />
            ) : (
              <Link href={`/card/${center.handle}`} className="block">
                <PrizeCard card={center} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <p className="px-4 text-center text-sm text-cream/50">
        {usingSamples
          ? "The cards above are samples. A real card uses your X photo."
          : "Freshly cut cards. Photos come from public X profiles."}
      </p>

      <div className="mt-10 overflow-hidden border-y border-gold/15 py-4">
        <div className="marquee-track flex items-center gap-8 py-1 leading-8 whitespace-nowrap text-sm tracking-[0.18em] text-gold/80">
          {Array.from({ length: 2 }, (_, copy) => (
            <span key={copy} className="flex gap-8">
              <span>Hold sparks</span>
              <span>Referral bonus</span>
              <span>Invite milestones</span>
              <span>Jackpot tickets</span>
              <span>X profile card</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl">Four steps in</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Give your handle", "No password. A public X handle brings your name and photo."],
            ["02", "Cut a card", "One card per person. Five rarities, each with a serial number."],
            ["03", "Sparks pile up", "Hold, refer, and hit a milestone after enough invites."],
            ["04", "Spin the wheel", "More tickets means a better shot at the jackpot."],
          ].map(([index, title, copy]) => (
            <li key={index} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-mono text-gold">{index}</p>
              <h3 className="mt-3 text-xl">{title}</h3>
              <p className="mt-2 text-sm text-cream/65">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:px-6 lg:grid-cols-3">
        <RewardBlock
          kicker="Hold"
          title={`Sparks every ${HOLD_UNIT_LABEL}`}
          copy="Rarer cards earn faster. The rate runs from Common up to Mythic."
          lines={Object.values(RARITIES).map(
            (rarity) => `${rarity.label} · ${formatNumber(rarity.holdPerUnit)} / ${HOLD_UNIT_LABEL}`,
          )}
        />
        <RewardBlock
          kicker="Refer"
          title="Bring people with a link"
          copy={`When a new holder uses your link, you get ${formatNumber(REFERRER_BONUS)} sparks and they get ${formatNumber(INVITEE_BONUS)}.`}
          lines={[`Join bonus ${formatNumber(JOIN_BONUS)}`, `Pool grows by ${formatNumber(POOL_PER_JOIN)}`]}
        />
        <RewardBlock
          kicker="Invite"
          title="Extra at each milestone"
          copy="Milestones sit on top of referrals. The bonus lands on its own when the count is met."
          lines={MILESTONES.map(
            (milestone) => `${milestone.title} · ${formatNumber(milestone.bonus)}`,
          )}
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Recent cards</h2>
          <Link href="/board" className="text-sm text-gold">
            Full board
          </Link>
        </div>
        {stats.latest.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-gold/25 px-5 py-10 text-cream/65">
            Nobody has cut a card yet. The first serial can be yours.
          </p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {stats.latest.map((card) => (
              <li key={card.handle}>
                <CardRow card={card} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-gold/25 bg-[radial-gradient(circle_at_top_left,rgba(240,195,106,0.18),transparent_40%),rgba(255,255,255,0.03)] p-6 sm:p-10">
          <p className="text-xs tracking-[0.2em] text-gold uppercase">pump.fun</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl sm:text-4xl">
            The token lives there. Cards, sparks, and the jackpot live here.
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            {pump.ready
              ? "The buy link is pointed at your coin."
              : "No coin address yet. Set the mint from env.example and the button goes straight to that coin."}
          </p>
          {pump.mint ? (
            <p className="mt-3 break-all font-mono text-xs text-cream/50">{pump.mint}</p>
          ) : null}
          <a
            href={pump.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-gold px-6 font-medium text-ink"
          >
            {pump.ready ? `Buy ${TOKEN.ticker} on pump.fun` : "Open pump.fun"}
          </a>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-cream/50">{label}</dt>
      <dd className="mt-1 font-mono text-2xl text-cream">{formatNumber(value)}</dd>
    </div>
  );
}

function RewardBlock({
  kicker,
  title,
  copy,
  lines,
}: {
  kicker: string;
  title: string;
  copy: string;
  lines: string[];
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <p className="text-xs tracking-[0.18em] text-mint uppercase">{kicker}</p>
      <h3 className="mt-2 text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-cream/65">{copy}</p>
      <ul className="mt-4 space-y-1 text-sm text-cream/85">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
}

function CardRow({ card }: { card: PublicCard }) {
  return (
    <Link
      href={`/card/${card.handle}`}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 hover:border-gold/40"
    >
      <Avatar src={card.avatar} name={card.name} className="size-12 rounded-full" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{card.name}</span>
        <span className="block text-xs text-cream/50">
          @{card.displayHandle} · {card.rarityLabel}
        </span>
      </span>
      <span className="text-right text-sm">
        <span className="block font-mono text-gold">{formatNumber(card.sparks)}</span>
        <span className="block text-xs text-cream/45">{formatCompact(card.followers)} followers</span>
      </span>
    </Link>
  );
}
