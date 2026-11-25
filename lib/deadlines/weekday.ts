// The weekday of a due date, in French and in lower case: "vendredi". The date
// comes from the caller, never from the clock, so the same day always gives the
// same label. The wording comes from Intl.DateTimeFormat: the French locale
// ships with Node and with every browser, and no dependency is added. The case
// is lowered here rather than assumed from the locale's format.
const WEEKDAY = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });

export function formatDeadlineWeekday(date: Date): string {
  return WEEKDAY.format(date).toLowerCase();
}
