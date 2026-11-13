import { describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  parseDeadlines,
  readDeadlines,
  serializeDeadlines,
  writeDeadlines,
} from "./storage";
import type { Deadline } from "./types";

const VALID: Deadline = {
  id: "1",
  title: "Assurance habitation",
  description: "Échéance annuelle.",
  category: "Contrats",
  date: "2026-11-14",
  frequency: "Annuelle",
  done: false,
};

describe("STORAGE_KEY", () => {
  it("is the only key the project writes", () => {
    expect(STORAGE_KEY).toBe("deadline-keeper:deadlines:v1");
  });
});
describe("serializeDeadlines", () => {
  it("serialises the list as JSON", () => {
    expect(serializeDeadlines([VALID])).toBe(JSON.stringify([VALID]));
    expect(serializeDeadlines([])).toBe("[]");
  });
});
describe("parseDeadlines", () => {
  it("returns an empty list for a missing or unusable entry", () => {
    for (const raw of [null, "", "   ", "pas du json", "{}", '"texte"', "42"]) {
      expect(parseDeadlines(raw)).toEqual([]);
    }
  });
  it("reads back what serializeDeadlines wrote", () => {
    expect(parseDeadlines(serializeDeadlines([VALID]))).toEqual([VALID]);
    expect(parseDeadlines("[]")).toEqual([]);
  });
  it("drops the malformed entries instead of repairing them", () => {
    const raw = JSON.stringify([
      VALID,
      { ...VALID, id: 2 }, { ...VALID, title: null }, { ...VALID, description: undefined },
      { ...VALID, category: "Impôts" }, { ...VALID, frequency: "Trimestrielle" },
      { ...VALID, date: "2026-02-30" }, { ...VALID, date: "14/11/2026" },
      { ...VALID, done: "non" }, { ...VALID, done: 1 },
      "texte", null, ["tableau"],
    ]);
    expect(parseDeadlines(raw)).toEqual([VALID]);
  });
  it("keeps an entry whose fields are all valid, done included", () => {
    const done = { ...VALID, id: "2", done: true, description: "" };
    expect(parseDeadlines(JSON.stringify([VALID, done]))).toEqual([VALID, done]);
  });
});
describe("readDeadlines", () => {
  it("reads under STORAGE_KEY, and starts empty when the storage holds nothing", () => {
    const getItem = vi.fn(() => serializeDeadlines([VALID]));
    expect(readDeadlines({ getItem })).toEqual([VALID]);
    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY);
    expect(readDeadlines({ getItem: () => null })).toEqual([]);
  });
  it("starts an empty list when getItem throws", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage refused");
      },
    };
    expect(readDeadlines(storage)).toEqual([]);
  });
});
describe("writeDeadlines", () => {
  it("writes the serialised list under STORAGE_KEY, an empty list included", () => {
    const setItem = vi.fn();
    writeDeadlines({ setItem }, [VALID]);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, serializeDeadlines([VALID]));
    writeDeadlines({ setItem }, []);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, "[]");
  });
});
