"use client";

import { useSyncExternalStore } from "react";

// The day the browser lives in, as an AAAA-MM-JJ string. The build has no
// browser date: the server render returns null, and the mounted page reads the
// real one. No effect and no state carry the date, so a page opened the next
// day reads the new one without a stale copy.
function subscribe(): () => void {
  // The date is read again at every render: nothing to listen to, and the
  // cleanup does nothing.
  return () => {};
}

function toLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Read in the browser's calendar, never through toISOString, which writes the
// UTC day: west of Greenwich at night, it names yesterday.
function getSnapshot(): string {
  return toLocalDate(new Date());
}

// The build is not "today": a prerendered page must not depend on the day it
// was built, and the server has no browser calendar to read.
function getServerSnapshot(): null {
  return null;
}

export function useToday(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
