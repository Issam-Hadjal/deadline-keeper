// A date is an AAAA-MM-JJ string. It is read by its components, in the local
// calendar: new Date("AAAA-MM-JJ") reads UTC instead, and names the day before
// west of Greenwich. A string outside that shape is reported, never guessed.
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function localDate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (match === null) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

// Whole days from `from` to `to`, negative when `to` is earlier, null when one
// of the two is not an AAAA-MM-JJ date. Rounded, so the 23 or 25 hours of a
// daylight-saving day still count as one day.
export function daysBetween(from: string, to: string): number | null {
  const start = localDate(from);
  const end = localDate(to);
  if (start === null || end === null) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}
