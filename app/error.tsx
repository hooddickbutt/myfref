"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">This page stalled</h1>
      <p className="mt-3 text-cream/70">Open it again and the card ledger should still be there.</p>
      <Button type="button" className="mt-6 h-11 rounded-full px-5" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
