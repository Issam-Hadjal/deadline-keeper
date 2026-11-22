// How far the due date is from the reference date, in calendar days, in
// French: "aujourd'hui", "demain", "dans 3 jours", "il y a 3 jours". Both dates
// come from the caller, never from the clock, so the same pair always gives the
// same label. The labels come from Intl.RelativeTimeFormat: the French locale
// ships with Node and with every browser, and no dependency is added.
const IN_WORDS = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
const IN_NUMBERS = new Intl.RelativeTimeFormat("fr", { numeric: "always" });

// The calendar day of a date, as a UTC midnight: the hours vanish, and the 23
// or 25 hours of a daylight-saving day still count as one day.
function calendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRemainingDays(due: Date, reference: Date): string {
  const days = Math.round((calendarDay(due) - calendarDay(reference)) / 86_400_000);
  // No valid date pair to compare: no label rather than a wrong one.
  if (Number.isNaN(days)) return "";
  // The wording mode gives "aujourd'hui" and "demain"; it would say
  // "après-demain" at +2 and "avant-hier" at -2, which the contract refuses.
  const label = days === 0 || days === 1
    ? IN_WORDS.format(days, "day")
    : IN_NUMBERS.format(days, "day");
  // The interface writes the straight apostrophe, Intl the typographic one.
  return label.replace(/\u2019/g, "'");
}
