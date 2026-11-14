import { daysBetween } from "./date";
import type { Deadline } from "./types";

// The four classes the dashboard counts. ASCII, without accents: these are
// identifiers, not labels; the interface writes its own words.
export type DeadlineBucket = "a-venir" | "urgente" | "en-retard" | "faite";

// The class of a deadline, in this order: done first, whatever its date; then
// past its date; then due within seven days, today and J+7 included; then the
// rest. Today is an argument, never the clock: the build must not depend on the
// day it runs, and a page opened the next day must classify again.
export function classifyDeadline(deadline: Deadline, today: string): DeadlineBucket {
  if (deadline.done) return "faite";
  const offset = daysBetween(today, deadline.date);
  // The storage only ever keeps AAAA-MM-JJ dates; anything else has nothing
  // valid to judge, so the neutral class rather than a wrong one.
  if (offset === null) return "a-venir";
  if (offset < 0) return "en-retard";
  if (offset <= 7) return "urgente";
  return "a-venir";
}

// The four keys are always there, at zero when no deadline falls in the class:
// the dashboard reads a counter without asking whether it exists.
export function countByBucket(
  deadlines: Deadline[],
  today: string,
): Record<DeadlineBucket, number> {
  const counts: Record<DeadlineBucket, number> = {
    "a-venir": 0,
    urgente: 0,
    "en-retard": 0,
    faite: 0,
  };
  for (const deadline of deadlines) counts[classifyDeadline(deadline, today)] += 1;
  return counts;
}
