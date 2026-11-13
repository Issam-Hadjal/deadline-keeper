// A date is an AAAA-MM-JJ string, formatted as the interface shows it: day,
// month, year. The string is split, never parsed into a Date object, so no
// timezone can move a deadline to the day before.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatFrenchDate(date: string): string {
  if (!ISO_DATE.test(date)) return date;
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
