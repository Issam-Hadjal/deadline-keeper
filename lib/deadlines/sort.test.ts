import { describe, expect, it } from "vitest";
import { sortDeadlines } from "./sort";
import type { Deadline } from "./types";

const deadline = (overrides: Partial<Deadline>): Deadline => ({
  id: "id",
  title: "Titre",
  description: "",
  category: "Autre",
  date: "2026-11-14",
  frequency: "Une fois",
  done: false,
  ...overrides,
});
const titles = (deadlines: Deadline[]): string[] => deadlines.map((entry) => entry.title);

describe("sortDeadlines", () => {
  it("puts the deadlines left to do first, then the done ones by date", () => {
    const mixed = [deadline({ title: "Faite", done: true }), deadline({ title: "À faire" })];
    const done = [
      deadline({ title: "Plus tard", date: "2027-03-01", done: true }),
      deadline({ title: "Plus tôt", date: "2025-03-01", done: true }),
    ];
    expect(titles(sortDeadlines(mixed))).toEqual(["À faire", "Faite"]);
    expect(titles(sortDeadlines(done))).toEqual(["Plus tôt", "Plus tard"]);
  });
  it("sorts each group by increasing date, across months and years", () => {
    const list = [
      deadline({ title: "Décembre", date: "2026-12-01" }),
      deadline({ title: "Janvier", date: "2027-01-01" }),
      deadline({ title: "Novembre", date: "2026-11-30" }),
    ];
    expect(titles(sortDeadlines(list))).toEqual(["Novembre", "Décembre", "Janvier"]);
  });
  it("orders the same day by title, in French", () => {
    const list = [deadline({ title: "Zoé" }), deadline({ title: "Élodie" }), deadline({ title: "Amine" })];
    expect(titles(sortDeadlines(list))).toEqual(["Amine", "Élodie", "Zoé"]);
  });
  it("returns a new array and leaves the received one untouched, empty included", () => {
    const list = [
      deadline({ title: "Deuxième", date: "2026-12-01" }),
      deadline({ title: "Premier", date: "2026-11-01" }),
    ];
    const copy = [...list];
    const sorted = sortDeadlines(list);
    expect(sorted).not.toBe(list);
    expect(list).toEqual(copy);
    expect(titles(sorted)).toEqual(["Premier", "Deuxième"]);
    expect(sortDeadlines([])).toEqual([]);
  });
});
