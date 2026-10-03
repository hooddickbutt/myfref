const banglaDigits = "০১২৩৪৫৬৭৮৯";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("bn-BD").format(Math.floor(value));
}

export function formatSerial(value: number) {
  const raw = String(Math.max(0, Math.floor(value))).padStart(5, "0");
  return raw.replace(/\d/g, (digit) => banglaDigits[Number(digit)] ?? digit);
}

export function formatCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 10_000_000) return `${formatNumber(Math.round(value / 10_000_000))} কোটি`;
  if (abs >= 100_000) return `${formatNumber(Math.round(value / 100_000))} লাখ`;
  if (abs >= 1_000) return `${formatNumber(Math.round(value / 1_000))} হাজার`;
  return formatNumber(value);
}

export function formatPercent(fraction: number) {
  return new Intl.NumberFormat("bn-BD", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(fraction);
}

export function formatWhen(timestamp: number) {
  return new Intl.DateTimeFormat("bn-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}
