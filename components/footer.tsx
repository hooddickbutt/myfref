import { TOKEN } from "@/lib/economy";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-cream/55 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {TOKEN.name} cards. Sparks are points on this site. Buying and selling happens on pump.fun, at your own risk.
        </p>
        <p className="font-display tracking-[0.18em] text-gold/80">{TOKEN.ticker}</p>
      </div>
    </footer>
  );
}
