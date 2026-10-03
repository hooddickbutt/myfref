import { TOKEN } from "@/lib/economy";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-cream/55 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {TOKEN.name} কার্ড। স্পার্ক এই সাইটের পয়েন্ট — কেনাবেচা পাম্পফানে, নিজের বিচারে।
        </p>
        <p className="font-display tracking-[0.18em] text-gold/80">{TOKEN.ticker}</p>
      </div>
    </footer>
  );
}
