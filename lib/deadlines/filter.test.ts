import { describe, expect, it } from "vitest";
import { filterDeadlines } from "./filter";
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
const ids = (deadlines: Deadline[]): string[] => deadlines.map((entry) => entry.id);
const LIST = [
  deadline({ id: "1", title: "Assurance habitation", category: "Contrats" }),
  deadline({
    id: "2",
    title: "Abonnement musique",
    description: "Renouvellement automatique chaque mois.",
    category: "Abonnements",
  }),
  deadline({ id: "3", title: "Carte grise", description: "Démarche en préfecture.", category: "Démarches administratives" }),
];

describe("filterDeadlines", () => {
  it("filters nothing when the category is Toutes and the search is empty", () => {
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "" }))).toEqual(["1", "2", "3"]);
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "   " }))).toEqual(["1", "2", "3"]);
  });
  it("narrows by category, down to an empty list", () => {
    expect(ids(filterDeadlines(LIST, { category: "Abonnements", query: "" }))).toEqual(["2"]);
    expect(ids(filterDeadlines(LIST, { category: "Garanties", query: "" }))).toEqual([]);
  });
  it("searches in the title, ignoring case and the spaces around the search", () => {
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "  ASSURANCE " }))).toEqual(["1"]);
  });
  it("searches in the description, ignoring case", () => {
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "préfecture" }))).toEqual(["3"]);
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "RENOUVELLEMENT" }))).toEqual(["2"]);
  });
  it("combines the category and the search, and returns nothing without a match", () => {
    expect(ids(filterDeadlines(LIST, { category: "Contrats", query: "musique" }))).toEqual([]);
    expect(ids(filterDeadlines(LIST, { category: "Abonnements", query: "musique" }))).toEqual(["2"]);
    expect(ids(filterDeadlines(LIST, { category: "Toutes", query: "inexistant" }))).toEqual([]);
  });
  it("keeps the received order and leaves the received array untouched", () => {
    const list = [deadline({ id: "b", date: "2026-12-01" }), deadline({ id: "a", date: "2026-11-01" })];
    const copy = [...list];
    const filtered = filterDeadlines(list, { category: "Toutes", query: "" });
    expect(filtered).not.toBe(list);
    expect(ids(filtered)).toEqual(["b", "a"]);
    expect(list).toEqual(copy);
  });
});
