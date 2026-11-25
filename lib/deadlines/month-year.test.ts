import { describe, expect, it } from "vitest";
import { formatMonthYear } from "./month-year";

describe("formatMonthYear", () => {
  it("names the month and the year of a due date in French, in lower case", () => {
    expect(formatMonthYear(new Date(2026, 11, 4))).toBe("décembre 2026");
  });

  it("names the first month of a later year", () => {
    expect(formatMonthYear(new Date(2027, 0, 15))).toBe("janvier 2027");
  });

  it("names all twelve months in French, in lower case", () => {
    const expected = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    const labels = expected.map((_, month) => formatMonthYear(new Date(2026, month, 1)));
    expect(labels).toEqual(expected.map((month) => `${month} 2026`));
  });

  it("keeps the same label whatever the day of the month", () => {
    expect(formatMonthYear(new Date(2026, 11, 1))).toBe("décembre 2026");
    expect(formatMonthYear(new Date(2026, 11, 31))).toBe("décembre 2026");
  });
});
