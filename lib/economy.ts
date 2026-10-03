import type { Holder, PublicCard, PublicDraw, Rarity, StoreData } from "@/lib/types";

export const TOKEN = {
  name: "HALO",
  ticker: "$HALO",
};

export const JOIN_BONUS = 100;
export const REFERRER_BONUS = 200;
export const INVITEE_BONUS = 80;
export const POOL_PER_JOIN = 50;
export const JACKPOT_PAYOUT = 0.7;
export const JACKPOT_COOLDOWN_MS = 30_000;
export const MIN_DRAW_HOLDERS = 2;
export const MIN_POOL = 50;
export const HOLD_UNIT_MS = 60_000;
export const HOLD_UNIT_LABEL = "মিনিট";

export const MILESTONES = [
  { count: 3, bonus: 400, title: "তিনজনকে আনো" },
  { count: 10, bonus: 1500, title: "দশজনকে আনো" },
  { count: 25, bonus: 5000, title: "পঁচিশজনকে আনো" },
] as const;

export const RARITIES: Record<
  Rarity,
  {
    bn: string;
    weight: number;
    holdPerUnit: number;
    tickets: number;
    ink: string;
    glow: string;
  }
> = {
  common: {
    bn: "সাধারণ",
    weight: 55,
    holdPerUnit: 1,
    tickets: 1,
    ink: "#d9d3c7",
    glow: "rgba(217,211,199,0.55)",
  },
  rare: {
    bn: "বিরল",
    weight: 25,
    holdPerUnit: 2,
    tickets: 2,
    ink: "#8ecbff",
    glow: "rgba(126,200,255,0.6)",
  },
  epic: {
    bn: "এপিক",
    weight: 12,
    holdPerUnit: 3,
    tickets: 4,
    ink: "#d2a6ff",
    glow: "rgba(192,132,252,0.62)",
  },
  legendary: {
    bn: "লেজেন্ডারি",
    weight: 6,
    holdPerUnit: 5,
    tickets: 8,
    ink: "#f0c36a",
    glow: "rgba(240,195,106,0.7)",
  },
  mythic: {
    bn: "মিথিক",
    weight: 2,
    holdPerUnit: 8,
    tickets: 16,
    ink: "#ff6b8a",
    glow: "rgba(255,107,138,0.72)",
  },
};

export function rollRarity(random = Math.random()): Rarity {
  let cursor = random * 100;
  const order: Rarity[] = ["common", "rare", "epic", "legendary", "mythic"];
  for (const rarity of order) {
    cursor -= RARITIES[rarity].weight;
    if (cursor <= 0) return rarity;
  }
  return "common";
}

export function holdSparks(holder: Holder, now = Date.now()) {
  const units = Math.floor(Math.max(0, now - holder.createdAt) / HOLD_UNIT_MS);
  return units * RARITIES[holder.rarity].holdPerUnit;
}

export function totalSparks(holder: Holder, now = Date.now()) {
  return holder.baseSparks + holdSparks(holder, now);
}

export function ticketCount(holder: Holder) {
  return RARITIES[holder.rarity].tickets + holder.referrals.length;
}

export function presentHolder(holder: Holder, now = Date.now()): PublicCard {
  return {
    handle: holder.handle,
    displayHandle: holder.displayHandle,
    name: holder.name,
    avatar: holder.avatar,
    bio: holder.bio,
    followers: holder.followers,
    serial: holder.serial,
    rarity: holder.rarity,
    rarityLabel: RARITIES[holder.rarity].bn,
    sparks: totalSparks(holder, now),
    holdSparks: holdSparks(holder, now),
    baseSparks: holder.baseSparks,
    holdPerUnit: RARITIES[holder.rarity].holdPerUnit,
    referrals: holder.referrals.length,
    invited: holder.referrals,
    tickets: ticketCount(holder),
    referredBy: holder.referredBy,
    createdAt: holder.createdAt,
    milestonesClaimed: holder.milestonesClaimed,
  };
}

export function presentDraw(draw: StoreData["draws"][number], holders: Holder[]): PublicDraw {
  const winner = holders.find((holder) => holder.handle === draw.winnerHandle);
  return {
    id: draw.id,
    winnerHandle: draw.winnerHandle,
    winnerName: winner?.name ?? draw.winnerHandle,
    winnerAvatar: winner?.avatar ?? null,
    prize: draw.prize,
    at: draw.at,
  };
}

export function nextMilestone(claimed: number[]) {
  return MILESTONES.find((milestone) => !claimed.includes(milestone.count)) ?? null;
}
