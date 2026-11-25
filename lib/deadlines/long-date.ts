// A due date written out in French: "vendredi 4 décembre 2026". The date comes
// from the caller, never from the clock, so the same date always gives the same
// label. The wording comes from Intl.DateTimeFormat: the French locale ships
// with Node and with every browser, and no dependency is added.
const LONG_DATE = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDueDateLong(due: Date): string {
  return LONG_DATE.format(due);
}
