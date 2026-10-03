export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.floor(value));
}

export function formatSerial(value: number) {
  return String(Math.max(0, Math.floor(value))).padStart(5, "0");
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(fraction: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(fraction);
}

export function formatWhen(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}
