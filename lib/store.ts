import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { GameError } from "@/lib/errors";
import {
  INVITEE_BONUS,
  JACKPOT_COOLDOWN_MS,
  JACKPOT_PAYOUT,
  JOIN_BONUS,
  MILESTONES,
  MIN_DRAW_HOLDERS,
  MIN_POOL,
  POOL_PER_JOIN,
  REFERRER_BONUS,
  presentDraw,
  presentHolder,
  rollRarity,
  ticketCount,
} from "@/lib/economy";
import type { Holder, HomeStats, PublicCard, StoreData } from "@/lib/types";
import { lookupXProfile } from "@/lib/x-profile";

const filePath = path.join(process.cwd(), "data", "store.json");

function emptyStore(): StoreData {
  return { nextSerial: 1, pool: 0, lastDrawAt: 0, holders: [], draws: [] };
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    if (!parsed || !Array.isArray(parsed.holders) || !Array.isArray(parsed.draws)) {
      return emptyStore();
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyStore();
    throw error;
  }
}

async function writeStore(store: StoreData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2));
  await rename(tempPath, filePath);
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function normalizeHandle(input: string | null | undefined) {
  const clean = (input ?? "").trim().replace(/^@+/, "").toLowerCase();
  if (!clean) return null;
  if (!/^[a-z0-9_]{1,15}$/.test(clean)) return null;
  return clean;
}

function applyMilestones(holder: Holder) {
  const earned: string[] = [];
  for (const milestone of MILESTONES) {
    if (
      holder.referrals.length >= milestone.count &&
      !holder.milestonesClaimed.includes(milestone.count)
    ) {
      holder.milestonesClaimed.push(milestone.count);
      holder.baseSparks += milestone.bonus;
      earned.push(milestone.title);
    }
  }
  return earned;
}

export async function getHolder(handle: string) {
  const store = await readStore();
  const holder = store.holders.find((item) => item.handle === handle);
  return holder ? presentHolder(holder) : null;
}

export async function getHomeStats(): Promise<HomeStats> {
  const store = await readStore();
  const now = Date.now();
  const cards = store.holders.map((holder) => presentHolder(holder, now));
  const latest = [...cards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  const top = [...cards].sort((a, b) => b.sparks - a.sparks).slice(0, 5);
  const last = store.draws[0];
  return {
    holders: cards.length,
    pool: store.pool,
    latest,
    top,
    lastDraw: last ? presentDraw(last, store.holders) : null,
  };
}

export async function listCards(): Promise<PublicCard[]> {
  const store = await readStore();
  const now = Date.now();
  return store.holders
    .map((holder) => presentHolder(holder, now))
    .sort((a, b) => b.sparks - a.sparks);
}

export async function getJackpotState() {
  const store = await readStore();
  const now = Date.now();
  const entrants = store.holders
    .map((holder) => presentHolder(holder, now))
    .sort((a, b) => b.tickets - a.tickets);
  const ticketTotal = entrants.reduce((sum, card) => sum + card.tickets, 0) || 1;
  return {
    pool: store.pool,
    holderCount: entrants.length,
    cooldownMs: JACKPOT_COOLDOWN_MS,
    nextDrawAt: store.lastDrawAt ? store.lastDrawAt + JACKPOT_COOLDOWN_MS : 0,
    serverNow: now,
    minHolders: MIN_DRAW_HOLDERS,
    minPool: MIN_POOL,
    entrants: entrants.map((card) => ({
      ...card,
      chance: card.tickets / ticketTotal,
    })),
    draws: store.draws.slice(0, 12).map((draw) => presentDraw(draw, store.holders)),
  };
}

export async function joinHolder(handleInput: string, refInput?: string | null) {
  const handle = normalizeHandle(handleInput);
  if (!handle) {
    throw new GameError("সঠিক এক্স আইডি দাও। শুধু অক্ষর, সংখ্যা আর আন্ডারস্কোর — যেমন nasa।");
  }

  const rawRef = (refInput ?? "").trim();
  const referredBy = rawRef ? normalizeHandle(rawRef) : null;
  if (rawRef && !referredBy) {
    throw new GameError("রেফার আইডি ঠিক নেই। খালি রেখেও কার্ড কাটা যায়।");
  }

  const existing = await getHolder(handle);
  if (existing) {
    return {
      created: false,
      card: existing,
      note: "এই এক্স আইডির কার্ড আগেই কাটা আছে।",
      referrer: existing.referredBy,
    };
  }

  const lookup = await lookupXProfile(handle);
  if (lookup.status === "missing") {
    throw new GameError("এই এক্স আইডি পাওয়া যায়নি। বানান দেখে আবার দাও।");
  }
  if (lookup.status === "down") {
    throw new GameError("এক্সের পাবলিক প্রোফাইল এখন ধরা যাচ্ছে না। একটু পরে আবার চেষ্টা করো।");
  }

  const profile = lookup.profile;

  return enqueue(async () => {
    const store = await readStore();
    const again = store.holders.find((item) => item.handle === handle);
    if (again) {
      return {
        created: false,
        card: presentHolder(again),
        note: "এই এক্স আইডির কার্ড আগেই কাটা আছে।",
        referrer: again.referredBy,
      };
    }

    const referrer =
      referredBy && referredBy !== handle
        ? store.holders.find((item) => item.handle === referredBy)
        : undefined;

    const holder: Holder = {
      handle,
      displayHandle: profile.screenName,
      name: profile.name,
      avatar: profile.avatar,
      bio: profile.bio,
      followers: profile.followers,
      serial: store.nextSerial,
      rarity: rollRarity(),
      baseSparks: JOIN_BONUS + (referrer ? INVITEE_BONUS : 0),
      referredBy: referrer ? referrer.handle : null,
      referrals: [],
      milestonesClaimed: [],
      createdAt: Date.now(),
    };

    store.nextSerial += 1;
    store.pool += POOL_PER_JOIN;
    store.holders.push(holder);

    const milestones: string[] = [];
    if (referrer) {
      referrer.referrals.push(handle);
      referrer.baseSparks += REFERRER_BONUS;
      milestones.push(...applyMilestones(referrer));
    }

    await writeStore(store);

    const ignoredRef = Boolean(referredBy && referredBy !== handle && !referrer);
    const note = referrer
      ? `@${referrer.displayHandle} এর লিংকে এসেছ। তুমি ${INVITEE_BONUS} স্পার্ক বেশি পেয়েছ।`
      : ignoredRef
        ? "রেফার আইডি পাওয়া যায়নি, তাই কার্ড একাই কাটা হয়েছে।"
        : "কার্ড কাটা হয়েছে। প্রোফাইল ছবি বসে গেছে।";

    return {
      created: true,
      card: presentHolder(holder),
      note,
      referrer: referrer?.handle ?? null,
      milestones,
    };
  });
}

export async function refreshHolder(handleInput: string) {
  const handle = normalizeHandle(handleInput);
  if (!handle) throw new GameError("আইডি ঠিক নেই।");

  const lookup = await lookupXProfile(handle);
  if (lookup.status === "missing") {
    throw new GameError("এই এক্স প্রোফাইল এখন আর পাওয়া যাচ্ছে না।");
  }
  if (lookup.status === "down") {
    throw new GameError("প্রোফাইল আনা যায়নি। একটু পরে আবার চেষ্টা করো।");
  }

  return enqueue(async () => {
    const store = await readStore();
    const holder = store.holders.find((item) => item.handle === handle);
    if (!holder) throw new GameError("এই কার্ড নেই।");
    holder.displayHandle = lookup.profile.screenName;
    holder.name = lookup.profile.name;
    holder.avatar = lookup.profile.avatar;
    holder.bio = lookup.profile.bio;
    holder.followers = lookup.profile.followers;
    await writeStore(store);
    return presentHolder(holder);
  });
}

export async function drawJackpot() {
  return enqueue(async () => {
    const store = await readStore();
    const now = Date.now();

    if (store.holders.length < MIN_DRAW_HOLDERS) {
      throw new GameError("জ্যাকপট ঘোরাতে অন্তত দুইজন হোল্ডার লাগবে।");
    }
    if (store.pool < MIN_POOL) {
      throw new GameError("প্রাইজ পুল এখনো ছোট। আরও কেউ জয়েন করলে পুল বাড়বে।");
    }
    if (store.lastDrawAt && now - store.lastDrawAt < JACKPOT_COOLDOWN_MS) {
      const wait = Math.ceil((JACKPOT_COOLDOWN_MS - (now - store.lastDrawAt)) / 1000);
      throw new GameError(`চাকা এখনো ঘুরছে। ${wait} সেকেন্ড পর আবার।`);
    }

    const weighted = store.holders.map((holder) => ({
      holder,
      weight: ticketCount(holder),
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    let winner = weighted[weighted.length - 1]?.holder;
    if (!winner) throw new GameError("হোল্ডার নেই।");
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) {
        winner = item.holder;
        break;
      }
    }

    const prize = Math.max(1, Math.floor(store.pool * JACKPOT_PAYOUT));
    store.pool -= prize;
    winner.baseSparks += prize;
    store.lastDrawAt = now;
    const draw = {
      id: `${now.toString(36)}-${winner.handle}`,
      winnerHandle: winner.handle,
      prize,
      at: now,
    };
    store.draws.unshift(draw);
    store.draws = store.draws.slice(0, 20);
    await writeStore(store);

    const state = {
      pool: store.pool,
      holderCount: store.holders.length,
      cooldownMs: JACKPOT_COOLDOWN_MS,
      nextDrawAt: now + JACKPOT_COOLDOWN_MS,
      serverNow: now,
      minHolders: MIN_DRAW_HOLDERS,
      minPool: MIN_POOL,
      entrants: store.holders
        .map((holder) => presentHolder(holder, now))
        .sort((a, b) => b.tickets - a.tickets)
        .map((card) => ({
          ...card,
          chance:
            card.tickets /
            (store.holders.reduce((sum, holder) => sum + ticketCount(holder), 0) || 1),
        })),
      draws: store.draws.slice(0, 12).map((item) => presentDraw(item, store.holders)),
      draw: presentDraw(draw, store.holders),
    };

    return state;
  });
}
