import { CATEGORIES, FREQUENCIES, type Deadline } from "./types";
import { isValidDate } from "./validation";

// The only key the project writes to the browser's localStorage.
export const STORAGE_KEY = "deadline-keeper:deadlines:v1";

export function serializeDeadlines(deadlines: Deadline[]): string {
  return JSON.stringify(deadlines);
}

// A stored entry is either exactly a Deadline or is dropped: nothing is repaired,
// so a corrupted entry never reaches the interface half-built.
function isDeadline(value: unknown): value is Deadline {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string" &&
    typeof entry.category === "string" &&
    CATEGORIES.some((category) => category === entry.category) &&
    typeof entry.date === "string" &&
    isValidDate(entry.date) &&
    typeof entry.frequency === "string" &&
    FREQUENCIES.some((frequency) => frequency === entry.frequency) &&
    typeof entry.done === "boolean"
  );
}

export function parseDeadlines(raw: string | null): Deadline[] {
  if (raw === null || raw.length === 0) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isDeadline) : [];
}

// The storage object arrives as an argument: lib/deadlines/ never touches window,
// and a browser that refuses storage starts an empty list instead of an error.
export function readDeadlines(storage: { getItem(key: string): string | null }): Deadline[] {
  try {
    return parseDeadlines(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function writeDeadlines(
  storage: { setItem(key: string, value: string): void },
  deadlines: Deadline[],
): void {
  storage.setItem(STORAGE_KEY, serializeDeadlines(deadlines));
}
