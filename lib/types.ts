export const RARITY_IDS = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
] as const;

export type Rarity = (typeof RARITY_IDS)[number];

export type Holder = {
  handle: string;
  displayHandle: string;
  name: string;
  avatar: string | null;
  bio: string;
  followers: number;
  serial: number;
  rarity: Rarity;
  baseSparks: number;
  referredBy: string | null;
  referrals: string[];
  milestonesClaimed: number[];
  createdAt: number;
};

export type Draw = {
  id: string;
  winnerHandle: string;
  prize: number;
  at: number;
};

export type StoreData = {
  nextSerial: number;
  pool: number;
  lastDrawAt: number;
  holders: Holder[];
  draws: Draw[];
};

export type PublicCard = {
  handle: string;
  displayHandle: string;
  name: string;
  avatar: string | null;
  bio: string;
  followers: number;
  serial: number;
  rarity: Rarity;
  rarityLabel: string;
  sparks: number;
  holdSparks: number;
  baseSparks: number;
  holdPerUnit: number;
  referrals: number;
  invited: string[];
  tickets: number;
  referredBy: string | null;
  createdAt: number;
  milestonesClaimed: number[];
  sample?: boolean;
};

export type PublicDraw = {
  id: string;
  winnerHandle: string;
  winnerName: string;
  winnerAvatar: string | null;
  prize: number;
  at: number;
};

export type HomeStats = {
  holders: number;
  pool: number;
  latest: PublicCard[];
  top: PublicCard[];
  lastDraw: PublicDraw | null;
};
