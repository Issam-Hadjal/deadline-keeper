import { describe, expect, it } from "vitest";
import type { Category, DeadlineInput, Frequency } from "./types";
import { validateDeadline } from "./validation";

const valid: DeadlineInput = {
  title: "Assurance habitation",
  description: "Échéance annuelle du contrat.",
  category: "Contrats",
  date: "2026-11-14",
  frequency: "Annuelle",
};
const withField = (overrides: Partial<DeadlineInput>): DeadlineInput => ({ ...valid, ...overrides });
const INVALID_DATE = { date: "Saisissez une date valide." };
// A form field can hold any text: these feed a value the type excludes.
const asCategory = (value: string): Category => value as Category;
const asFrequency = (value: string): Frequency => value as Frequency;

describe("validateDeadline", () => {
  it("accepts a valid input, an input without a description, the exact limits", () => {
    expect(validateDeadline(valid)).toEqual({});
    expect(validateDeadline(withField({ description: "" }))).toEqual({});
    expect(validateDeadline(withField({ title: `  ${"a".repeat(100)}  ` }))).toEqual({});
    expect(validateDeadline(withField({ description: "a".repeat(500) }))).toEqual({});
  });
  it("refuses a title of 101 characters and a description of 501", () => {
    expect(validateDeadline(withField({ title: "a".repeat(101) }))).toEqual({
      title: "Le titre ne doit pas dépasser 100 caractères.",
    });
    expect(validateDeadline(withField({ description: "a".repeat(501) }))).toEqual({
      description: "La description ne doit pas dépasser 500 caractères.",
    });
  });
  it("refuses a title that is empty once trimmed", () => {
    for (const title of ["", "   "]) {
      expect(validateDeadline(withField({ title }))).toEqual({ title: "Le titre est obligatoire." });
    }
  });
  it("refuses a category or a frequency outside the lists", () => {
    expect(validateDeadline(withField({ category: asCategory("Impôts") }))).toEqual({
      category: "Choisissez une catégorie.",
    });
    expect(validateDeadline(withField({ frequency: asFrequency("Trimestrielle") }))).toEqual({
      frequency: "Choisissez une fréquence.",
    });
  });
  it("refuses an empty date, a date that is not AAAA-MM-JJ, a date that does not exist", () => {
    expect(validateDeadline(withField({ date: "" }))).toEqual({ date: "La date est obligatoire." });
    for (const date of [
      "14/11/2026",
      "2026-11-4",
      "2026-11-14T00:00",
      "demain",
      "2026-02-30",
      "2026-13-01",
      "2026-04-31",
      "2026-01-00",
      "2026-00-10",
    ]) {
      expect(validateDeadline(withField({ date }))).toEqual(INVALID_DATE);
    }
  });
  it("accepts the 29th of February of a leap year only", () => {
    for (const date of ["2024-02-29", "2000-02-29"]) {
      expect(validateDeadline(withField({ date }))).toEqual({});
    }
    for (const date of ["2026-02-29", "1900-02-29"]) {
      expect(validateDeadline(withField({ date }))).toEqual(INVALID_DATE);
    }
  });
  it("reports every faulty field at once", () => {
    expect(
      validateDeadline({
        title: "",
        description: "a".repeat(501),
        category: asCategory("Impôts"),
        date: "2026-02-30",
        frequency: asFrequency("Trimestrielle"),
      }),
    ).toEqual({
      title: "Le titre est obligatoire.",
      description: "La description ne doit pas dépasser 500 caractères.",
      category: "Choisissez une catégorie.",
      date: "Saisissez une date valide.",
      frequency: "Choisissez une fréquence.",
    });
  });
});
