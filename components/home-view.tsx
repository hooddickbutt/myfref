"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
          <p className="text-xs tracking-[0.24em] text-mint uppercase">পাম্পফান · {TOKEN.ticker}</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.98] sm:text-7xl">
            এক্সে ঢোকো।
            <span className="mt-1 block text-gold">কার্ড নিয়ে বেরোও।</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/75">
            আইডি দিলেই পাবলিক প্রোফাইল ছবি কার্ডে বসে। হোল্ড করলে স্পার্ক বাড়ে, মানুষ আনলে বোনাস,
            চাকায় নাম উঠলে জ্যাকপট।
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<Link href="/join" />}
              className="h-12 rounded-full px-6 text-base"
              nativeButton={false}
            >
              কার্ড কাটো
            </Button>
            <Button
              variant="outline"
              render={<Link href="/jackpot" />}
              className="h-12 rounded-full border-gold/40 px-6 text-base text-gold"
              nativeButton={false}
            >
              জ্যাকপট দেখো
            </Button>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <Stat label="হোল্ডার" value={stats.holders} />
            <Stat label="প্রাইজ পুল" value={stats.pool} />
            <div>
              <dt className="text-xs text-cream/50">শেষ জয়</dt>
              <dd className="mt-1 truncate text-sm">
                {stats.lastDraw ? stats.lastDraw.winnerName : "এখনো হয়নি"}
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
          ? "ওপরের কার্ড নমুনা। আসল কার্ডে তোমার এক্স ছবি বসবে।"
          : "সদ্য কাটা কার্ড। ছবি এক্সের পাবলিক প্রোফাইল থেকে।"}
      </p>

      <div className="mt-10 overflow-hidden border-y border-gold/15 py-3">
        <div className="marquee-track flex gap-8 whitespace-nowrap text-sm tracking-[0.18em] text-gold/80 uppercase">
          {Array.from({ length: 2 }, (_, copy) => (
            <span key={copy} className="flex gap-8">
              <span>হোল্ড স্পার্ক</span>
              <span>রেফার বোনাস</span>
              <span>ইনভাইট মাইলস্টোন</span>
              <span>জ্যাকপট টিকিট</span>
              <span>এক্স প্রোফাইল কার্ড</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl">চার ধাপে ভেতরে</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["০১", "আইডি দাও", "পাসওয়ার্ড নয়। পাবলিক এক্স আইডি, সেখান থেকে নাম আর ছবি।"],
            ["০২", "কার্ড কাটে", "একজনের একটা কার্ড। পাঁচ রকমের বিরলতা, সিরিয়াল নম্বরসহ।"],
            ["০৩", "স্পার্ক জমে", "হোল্ড, রেফার, আর নির্দিষ্ট সংখ্যক মানুষ আনলে মাইলস্টোন।"],
            ["০৪", "চাকা ঘোরে", "টিকিট যত বেশি, জ্যাকপটে নাম ওঠার সুযোগ তত বেশি।"],
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
          kicker="হোল্ড"
          title={`প্রতি ${HOLD_UNIT_LABEL}ে স্পার্ক`}
          copy="কার্ড যত দুর্লভ, হোল্ড রেট তত বেশি। সাধারণ থেকে মিথিক পর্যন্ত আলাদা হার।"
          lines={Object.values(RARITIES).map(
            (rarity) => `${rarity.bn} · ${formatNumber(rarity.holdPerUnit)} / ${HOLD_UNIT_LABEL}`,
          )}
        />
        <RewardBlock
          kicker="রেফার"
          title="লিংক দিয়ে আনো"
          copy={`নতুন হোল্ডার তোমার লিংকে এলে তুমি ${formatNumber(REFERRER_BONUS)} স্পার্ক, সে ${formatNumber(INVITEE_BONUS)}।`}
          lines={[`জয়েন বোনাস ${formatNumber(JOIN_BONUS)}`, `পুল বাড়ে ${formatNumber(POOL_PER_JOIN)}`]}
        />
        <RewardBlock
          kicker="ইনভাইট"
          title="মাইলস্টোনে অতিরিক্ত"
          copy="রেফারের ওপর আলাদা ধাপ। গুনতি পূরণ হলে বোনাস নিজে থেকে যোগ হয়।"
          lines={MILESTONES.map(
            (milestone) => `${milestone.title} · ${formatNumber(milestone.bonus)}`,
          )}
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">সাম্প্রতিক কার্ড</h2>
          <Link href="/board" className="text-sm text-gold">
            পুরো বোর্ড
          </Link>
        </div>
        {stats.latest.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-gold/25 px-5 py-10 text-cream/65">
            এখনো কেউ কার্ড কাটেনি। প্রথম সিরিয়াল তোমার হতে পারে।
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
          <p className="text-xs tracking-[0.2em] text-gold uppercase">পাম্পফান</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl sm:text-4xl">
            টোকেন ওখানে। কার্ড, স্পার্ক আর জ্যাকপট এই সাইটে।
          </h2>
          <p className="mt-4 max-w-2xl text-cream/70">
            {pump.ready
              ? "কেনার লিংক তোমার কয়েনে সেট করা আছে।"
              : "কয়েন অ্যাড্রেস এখনো বসানো হয়নি। env.example দেখে মিন্ট দিলে বোতাম সরাসরি সেই কয়েনে যাবে।"}
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
            {pump.ready ? `${TOKEN.ticker} কিনতে পাম্পফান` : "পাম্পফান খোলো"}
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
      <dd className="mt-1 font-mono text-2xl text-cream">
        <CountUp value={value} />
      </dd>
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / 800);
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{formatNumber(shown)}</>;
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
        <span className="block text-xs text-cream/45">{formatCompact(card.followers)} ফলোয়ার</span>
      </span>
    </Link>
  );
}
