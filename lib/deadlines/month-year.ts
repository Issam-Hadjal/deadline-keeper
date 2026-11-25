// The month and the year of a due date, in French and in lower case:
// "décembre 2026". The date comes from the caller, never from the clock, so the
// same date always gives the same label. The wording comes from
// Intl.DateTimeFormat with the French locale: it ships with Node and with every
// browser, and no dependency is added. Requirement 5 of issue #51 asked for
// luxon, which package.json does not declare; the native API holds the criteria
// (see the pull request). The case is lowered here rather than assumed from the
// locale's format, so the guarantee does not depend on the resolved locale.
const MONTH_YEAR = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function formatMonthYear(date: Date): string {
  return MONTH_YEAR.format(date).toLowerCase();
}
