export type XProfile = {
  screenName: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
};

export type ProfileLookup =
  | { status: "ok"; profile: XProfile }
  | { status: "missing" }
  | { status: "down" };

function safeAvatar(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname !== "pbs.twimg.com" && parsed.hostname !== "unavatar.io") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function biggerTwimg(url: string) {
  return url.replace("_normal.", "_400x400.").replace("_bigger.", "_400x400.");
}

async function readFx(handle: string, signal: AbortSignal): Promise<ProfileLookup | "continue"> {
  const response = await fetch(`https://api.fxtwitter.com/${handle}`, {
    signal,
    redirect: "manual",
    headers: {
      accept: "application/json",
      "user-agent": "HALO-Card/1.0",
    },
    cache: "no-store",
  });

  if (response.status === 404) return { status: "missing" };
  if (response.status !== 200) return "continue";

  const data = (await response.json()) as {
    code?: number;
    user?: {
      screen_name?: string;
      name?: string;
      avatar_url?: string;
      description?: string;
      followers?: number;
    };
  };

  if (data.code === 404 || !data.user?.screen_name) return { status: "missing" };

  const avatar =
    safeAvatar(data.user.avatar_url ? biggerTwimg(data.user.avatar_url) : undefined) ??
    `https://unavatar.io/x/${handle}`;

  return {
    status: "ok",
    profile: {
      screenName: data.user.screen_name,
      name: (data.user.name || data.user.screen_name).slice(0, 80),
      avatar,
      bio: (data.user.description || "").replace(/\s+/g, " ").trim().slice(0, 180),
      followers: Number(data.user.followers || 0),
    },
  };
}

async function readUnavatar(handle: string, signal: AbortSignal): Promise<ProfileLookup> {
  const response = await fetch(`https://unavatar.io/x/${handle}?fallback=false`, {
    signal,
    redirect: "follow",
    headers: { "user-agent": "HALO-Card/1.0" },
    cache: "no-store",
  });
  if (response.status === 404) return { status: "missing" };
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    return { status: "down" };
  }
  return {
    status: "ok",
    profile: {
      screenName: handle,
      name: handle,
      avatar: `https://unavatar.io/x/${handle}`,
      bio: "",
      followers: 0,
    },
  };
}

export async function lookupXProfile(handle: string): Promise<ProfileLookup> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    try {
      const primary = await readFx(handle, controller.signal);
      if (primary !== "continue") return primary;
    } catch {
      // Fall through to the image endpoint when the profile API is unreachable.
    }
    try {
      return await readUnavatar(handle, controller.signal);
    } catch {
      return { status: "down" };
    }
  } finally {
    clearTimeout(timer);
  }
}
