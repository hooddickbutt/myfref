"use client";

import { useSyncExternalStore } from "react";
import { HANDLE_EVENT, readHandle } from "@/lib/session";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(HANDLE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(HANDLE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useMyHandle() {
  return useSyncExternalStore(subscribe, readHandle, () => null);
}
