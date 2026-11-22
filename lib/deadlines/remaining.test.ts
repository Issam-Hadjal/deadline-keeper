import { describe, expect, it } from "vitest";
import { formatRemainingDays } from "./remaining";

const REFERENCE = new Date(2026, 10, 22, 9, 0);

describe("formatRemainingDays", () => {
  it("names the day itself whatever the hours of the two dates", () => {
    expect(formatRemainingDays(new Date(2026, 10, 22, 0, 5), new Date(2026, 10, 22, 23, 55))).toBe(
      "aujourd'hui",
    );
  });

  it("says demain for the next calendar day, even under twenty-four hours", () => {
    expect(formatRemainingDays(new Date(2026, 10, 23, 0, 30), new Date(2026, 10, 22, 23, 30))).toBe(
      "demain",
    );
  });

  it("counts the days ahead", () => {
    expect(formatRemainingDays(new Date(2026, 10, 24, 9, 0), REFERENCE)).toBe("dans 2 jours");
    expect(formatRemainingDays(new Date(2026, 10, 25, 9, 0), REFERENCE)).toBe("dans 3 jours");
  });

  it("counts the days late", () => {
    expect(formatRemainingDays(new Date(2026, 10, 21, 9, 0), REFERENCE)).toBe("il y a 1 jour");
    expect(formatRemainingDays(new Date(2026, 10, 20, 9, 0), REFERENCE)).toBe("il y a 2 jours");
    expect(formatRemainingDays(new Date(2026, 10, 19, 9, 0), REFERENCE)).toBe("il y a 3 jours");
  });

  it("counts across a month and a year", () => {
    expect(formatRemainingDays(new Date(2026, 11, 3), new Date(2026, 10, 30))).toBe("dans 3 jours");
    expect(formatRemainingDays(new Date(2026, 11, 29), new Date(2027, 0, 1))).toBe("il y a 3 jours");
  });

  it("has no label for an invalid date", () => {
    expect(formatRemainingDays(new Date("not a date"), REFERENCE)).toBe("");
    expect(formatRemainingDays(REFERENCE, new Date("not a date"))).toBe("");
  });
});
