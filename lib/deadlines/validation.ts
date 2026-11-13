import { CATEGORIES, FREQUENCIES, type DeadlineErrors, type DeadlineInput } from "./types";

// Dates are AAAA-MM-JJ strings. Whether one exists in the calendar is decided by
// arithmetic, never by a Date object: no timezone may shift a deadline's day.
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

// Exported for storage.ts: one rule for "a date that exists" across the feature.
export function isValidDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

export function validateDeadline(input: DeadlineInput): DeadlineErrors {
  const errors: DeadlineErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length === 0) errors.title = "Le titre est obligatoire.";
  else if (title.length > 100) errors.title = "Le titre ne doit pas dépasser 100 caractères.";
  if (description.length > 500)
    errors.description = "La description ne doit pas dépasser 500 caractères.";
  if (!CATEGORIES.some((category) => category === input.category))
    errors.category = "Choisissez une catégorie.";
  if (input.date.trim().length === 0) errors.date = "La date est obligatoire.";
  else if (!isValidDate(input.date)) errors.date = "Saisissez une date valide.";
  if (!FREQUENCIES.some((frequency) => frequency === input.frequency))
    errors.frequency = "Choisissez une fréquence.";
  return errors;
}
