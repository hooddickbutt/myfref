const mint = process.env.NEXT_PUBLIC_TOKEN_MINT?.trim() || "";
const explicitUrl = process.env.NEXT_PUBLIC_PUMP_URL?.trim() || "";

export const pump = {
  mint,
  url: explicitUrl || (mint ? `https://pump.fun/coin/${mint}` : "https://pump.fun"),
  ready: Boolean(mint),
};
