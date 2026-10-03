export const HANDLE_KEY = "halo-handle";
export const HANDLE_EVENT = "halo-handle";

export function rememberHandle(handle: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HANDLE_KEY, handle.toLowerCase());
  window.dispatchEvent(new Event(HANDLE_EVENT));
}

export function readHandle() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(HANDLE_KEY);
}
