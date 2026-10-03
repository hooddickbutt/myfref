import { Suspense } from "react";
import { JoinPanel } from "@/components/join-panel";

export const metadata = {
  title: "Join",
};

export default function JoinPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Suspense fallback={<p className="text-cream/60">Loading…</p>}>
        <JoinPanel />
      </Suspense>
    </div>
  );
}
