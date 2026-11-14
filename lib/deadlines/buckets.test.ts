import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyDeadline, countByBucket } from "./buckets";
import type { Deadline } from "./types";

function deadline(date: string, done = false): Deadline {
  return {
    id: `deadline-${date}`,
    title: "Assurance habitation",
    description: "Résilier avant la reconduction",
    category: "Contrats",
    date,
    frequency: "Annuelle",
    done,
  };
}

describe("classifyDeadline", () => {
  it("classes the six days of the table", () => {
    expect(classifyDeadline(deadline("2026-11-13"), "2026-11-14")).toBe("en-retard");
    expect(classifyDeadline(deadline("2026-11-14"), "2026-11-14")).toBe("urgente");
    expect(classifyDeadline(deadline("2026-11-15"), "2026-11-14")).toBe("urgente");
    expect(classifyDeadline(deadline("2026-11-21"), "2026-11-14")).toBe("urgente");
    expect(classifyDeadline(deadline("2026-11-22"), "2026-11-14")).toBe("a-venir");
  });

  it("keeps a done deadline in its own class, whatever its date", () => {
    expect(classifyDeadline(deadline("2026-11-01", true), "2026-11-14")).toBe("faite");
    expect(classifyDeadline(deadline("2026-11-14", true), "2026-11-14")).toBe("faite");
    expect(classifyDeadline(deadline("2026-12-31", true), "2026-11-14")).toBe("faite");
  });

  it("keeps J+7 urgent and J+8 upcoming across a month", () => {
    expect(classifyDeadline(deadline("2026-12-07"), "2026-11-30")).toBe("urgente");
    expect(classifyDeadline(deadline("2026-12-08"), "2026-11-30")).toBe("a-venir");
  });

  it("reads no clock", () => {
    for (const file of ["buckets.ts", "relative.ts", "date.ts"]) {
      const source = readFileSync(join(process.cwd(), `lib/deadlines/${file}`), "utf8");
      expect(source, file).not.toMatch(/Date\.now\s*\(/);
      expect(source, file).not.toMatch(/new Date\s*\(\s*\)/);
    }
  });
});

describe("countByBucket", () => {
  it("counts every class, at zero when no deadline falls in it", () => {
    expect(countByBucket([], "2026-11-14")).toEqual({
      "a-venir": 0,
      urgente: 0,
      "en-retard": 0,
      faite: 0,
    });
  });

  it("counts a mixed set class by class", () => {
    const deadlines = [
      deadline("2026-11-13"),
      deadline("2026-11-14"),
      deadline("2026-11-15"),
      deadline("2026-11-21"),
      deadline("2026-11-22"),
      deadline("2026-11-01", true),
    ];
    expect(countByBucket(deadlines, "2026-11-14")).toEqual({
      "a-venir": 1,
      urgente: 3,
      "en-retard": 1,
      faite: 1,
    });
  });
});
