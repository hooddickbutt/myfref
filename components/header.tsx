"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOKEN } from "@/lib/economy";
import { pump } from "@/lib/token";
import { useMyHandle } from "@/lib/use-my-handle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "হোম" },
  { href: "/join", label: "জয়েন" },
  { href: "/rewards", label: "রিওয়ার্ড" },
  { href: "/jackpot", label: "জ্যাকপট" },
  { href: "/board", label: "বোর্ড" },
];

export function Header() {
  const pathname = usePathname();
  const mine = useMyHandle();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-ink/75 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full border border-gold/50">
            <span className="size-2.5 rounded-full bg-mint" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-[0.16em] text-gold">
              {TOKEN.name}
            </span>
            <span className="block text-[11px] text-cream/60">প্রাইজ কার্ড</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 whitespace-nowrap text-cream/75 hover:text-cream",
                  active && "bg-white/10 text-gold",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {mine ? (
            <Link
              href={`/card/${mine}`}
              className="rounded-full bg-gold px-3 py-1.5 font-medium whitespace-nowrap text-ink"
            >
              আমার কার্ড
            </Link>
          ) : null}
          <a
            href={pump.url}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-gold/30 px-3 py-1.5 whitespace-nowrap text-gold sm:inline"
          >
            {TOKEN.ticker}
          </a>
        </nav>
      </div>
    </header>
  );
}
