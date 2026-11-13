import type { Deadline } from "./types";

// Outdated work still to do, then the rest; the nearest date first, and the
// title to decide between two deadlines of the same day. The dates are
// AAAA-MM-JJ strings: comparing them as strings sorts them by calendar order.
export function sortDeadlines(deadlines: Deadline[]): Deadline[] {
  return [...deadlines].sort((left, right) => {
    if (left.done !== right.done) return left.done ? 1 : -1;
    if (left.date !== right.date) return left.date < right.date ? -1 : 1;
    return left.title.localeCompare(right.title, "fr");
  });
}
