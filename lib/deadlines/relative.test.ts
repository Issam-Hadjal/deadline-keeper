import { describe, expect, it } from "vitest";
import { relativeDelayLabel } from "./relative";

describe("relativeDelayLabel", () => {
  it("names the day itself", () => {
    expect(relativeDelayLabel("2026-11-14", "2026-11-14")).toBe("aujourd'hui");
  });

  it("counts the days ahead, singular then plural", () => {
    expect(relativeDelayLabel("2026-11-15", "2026-11-14")).toBe("dans 1 jour");
    expect(relativeDelayLabel("2026-11-16", "2026-11-14")).toBe("dans 2 jours");
    expect(relativeDelayLabel("2026-11-21", "2026-11-14")).toBe("dans 7 jours");
    expect(relativeDelayLabel("2026-11-22", "2026-11-14")).toBe("dans 8 jours");
  });

  it("counts the days late, singular then plural", () => {
    expect(relativeDelayLabel("2026-11-13", "2026-11-14")).toBe("en retard de 1 jour");
    expect(relativeDelayLabel("2026-11-01", "2026-11-14")).toBe("en retard de 13 jours");
  });

  it("counts across a month and a year", () => {
    expect(relativeDelayLabel("2026-12-07", "2026-11-30")).toBe("dans 7 jours");
    expect(relativeDelayLabel("2027-01-02", "2026-12-31")).toBe("dans 2 jours");
    expect(relativeDelayLabel("2026-12-31", "2027-01-01")).toBe("en retard de 1 jour");
  });
});
