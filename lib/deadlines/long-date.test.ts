import { describe, expect, it } from "vitest";
import { formatDueDateLong } from "./long-date";

describe("formatDueDateLong", () => {
  it("writes a due date out in French, in full words", () => {
    expect(formatDueDateLong(new Date(2026, 11, 4, 12, 0, 0))).toBe(
      "vendredi 4 décembre 2026",
    );
  });

  it("names the last day of a month and its weekday", () => {
    expect(formatDueDateLong(new Date(2026, 11, 31, 12, 0, 0))).toBe(
      "jeudi 31 décembre 2026",
    );
  });

  it("keeps a one-digit day without a leading zero", () => {
    expect(formatDueDateLong(new Date(2026, 0, 1, 12, 0, 0))).toBe("jeudi 1 janvier 2026");
  });
});
