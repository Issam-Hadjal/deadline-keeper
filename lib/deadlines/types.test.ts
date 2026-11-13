import { describe, expect, it } from "vitest";
import { CATEGORIES, FREQUENCIES } from "./types";

describe("the deadline's closed lists", () => {
  it("holds the categories and the frequencies in the interface's order", () => {
    expect([...CATEGORIES]).toEqual([
      "Abonnements",
      "Contrats",
      "Garanties",
      "Démarches administratives",
      "Autre",
    ]);
    expect([...FREQUENCIES]).toEqual(["Une fois", "Mensuelle", "Annuelle"]);
  });
});
