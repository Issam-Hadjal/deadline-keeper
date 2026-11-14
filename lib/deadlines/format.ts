// A date is an AAAA-MM-JJ string, written as the interface shows it: 14 novembre
// 2026. It is read by its components, in the local calendar: parsing the whole
// string would read UTC and could name the day before, west of Greenwich.
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const FRENCH_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatFrenchDate(date: string): string {
  const match = ISO_DATE.exec(date);
  if (match === null) return date;
  return FRENCH_DATE.format(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}
