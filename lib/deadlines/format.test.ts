import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatFrenchDate } from "./format";

describe("formatFrenchDate", () => {
  it("shows a date as day, month and year", () => {
    expect(formatFrenchDate("2026-11-14")).toBe("14/11/2026");
    expect(formatFrenchDate("2026-01-01")).toBe("01/01/2026");
    expect(formatFrenchDate("2024-02-29")).toBe("29/02/2024");
  });

  it("returns anything else unchanged", () => {
    for (const value of ["", "14/11/2026", "2026-1-4", "2026-11-14T10:00", "demain"])
      expect(formatFrenchDate(value)).toBe(value);
  });

  it("builds no Date object: the string is only split", () => {
    const source = readFileSync(join(process.cwd(), "lib/deadlines/format.ts"), "utf8");
    expect(source).not.toMatch(/new Date|Date\.(now|parse|UTC)/);
  });
});
