import { JackpotPanel } from "@/components/jackpot-panel";

export const metadata = {
  title: "Jackpot",
};

export default function JackpotPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <JackpotPanel />
    </div>
  );
}
