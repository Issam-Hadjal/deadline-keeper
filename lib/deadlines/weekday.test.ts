import { describe, expect, it } from "vitest";
import { formatDeadlineWeekday } from "./weekday";

describe("formatDeadlineWeekday", () => {
  it("names the weekday of a due date in French, in lower case", () => {
    expect(formatDeadlineWeekday(new Date(2026, 11, 4))).toBe("vendredi");
  });

  it("names a Sunday", () => {
    expect(formatDeadlineWeekday(new Date(2026, 11, 6))).toBe("dimanche");
  });
});
