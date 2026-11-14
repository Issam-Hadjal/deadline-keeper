"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseDeadlines, STORAGE_KEY, writeDeadlines } from "@/lib/deadlines/storage";
import type { Deadline } from "@/lib/deadlines/types";

// The stored list belongs to the browser: the pages subscribe to it instead of
// copying it into a state from an effect. The snapshot is the raw string under
// STORAGE_KEY, so React re-renders only on a real change.
const listeners = new Set<() => void>();

function readSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // A browser that refuses storage starts an empty list instead of an error.
    return null;
  }
}

// The server knows nothing of the browser's storage: the prerender starts empty,
// then the mounted page reads what the browser kept.
function readServerSnapshot(): string | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab's write arrives as a "storage" event; this page's own writes fire
  // none, so notifyListeners tells the page itself.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

// One hook for the whole site: the deadlines page and the dashboard read the
// same key, in the same format, with the same subscription.
export function useStoredDeadlines(): Deadline[] {
  const raw = useSyncExternalStore(subscribe, readSnapshot, readServerSnapshot);
  return useMemo(() => parseDeadlines(raw), [raw]);
}

export function writeStoredDeadlines(deadlines: Deadline[]): void {
  writeDeadlines(window.localStorage, deadlines);
  notifyListeners();
}
