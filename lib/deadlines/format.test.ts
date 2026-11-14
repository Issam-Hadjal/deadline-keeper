import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatFrenchDate } from "./format";

describe("formatFrenchDate", () => {
  it("writes the day, the month in letters and the year", () => {
    expect(formatFrenchDate("2026-11-14")).toBe("14 novembre 2026");
    expect(formatFrenchDate("2026-01-01")).toBe("1 janvier 2026");
    expect(formatFrenchDate("2024-02-29")).toBe("29 février 2024");
  });

  it("returns anything else unchanged", () => {
    for (const value of ["", "14/11/2026", "2026-1-4", "2026-11-14T10:00", "demain"])
      expect(formatFrenchDate(value)).toBe(value);
  });

  it("reads the date by its components, never by parsing the string", () => {
    const source = readFileSync(join(process.cwd(), "lib/deadlines/format.ts"), "utf8");
    expect(source).not.toMatch(/new Date\(\s*["'`]/);
    expect(source).not.toMatch(/Date\.(now|parse)/);
  });
});
