"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">পেজটা আটকে গেছে</h1>
      <p className="mt-3 text-cream/70">আবার খুললে কার্ডের হিসাব থাকার কথা।</p>
      <Button type="button" className="mt-6 h-11 rounded-full px-5" onClick={() => reset()}>
        আবার চেষ্টা
      </Button>
    </div>
  );
}
