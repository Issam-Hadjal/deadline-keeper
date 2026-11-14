import { daysBetween } from "./date";

// How far the date is from today, in words: "aujourd'hui", "dans 1 jour",
// "en retard de 2 jours". Today comes from the caller, never from the clock, so
// the same pair of dates always gives the same label.
export function relativeDelayLabel(dueDate: string, today: string): string {
  const offset = daysBetween(today, dueDate);
  // No valid date pair to compare: no label rather than a wrong one.
  if (offset === null) return "";
  if (offset === 0) return "aujourd'hui";
  if (offset === 1) return "dans 1 jour";
  if (offset > 1) return `dans ${offset} jours`;
  const late = -offset;
  return late === 1 ? "en retard de 1 jour" : `en retard de ${late} jours`;
}
