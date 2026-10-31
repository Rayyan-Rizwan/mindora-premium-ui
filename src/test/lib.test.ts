import { describe, expect, it, vi } from "vitest";
import {
  daysAgoString,
  formatDate,
  greetingForHour,
  localDayString,
  parseUtcDate,
  relativeTime,
} from "@/lib/date";
import { MOOD_SCALE, describeMood } from "@/lib/mood";
import { describeApiError } from "@/lib/errors";
import { classNames, firstName, initials } from "@/lib/utils";

describe("parseUtcDate", () => {
  it("treats backend datetimes without an offset as UTC", () => {
    expect(parseUtcDate("2024-03-05T10:30:00").getTime()).toBe(
      Date.UTC(2024, 2, 5, 10, 30),
    );
  });

  it("keeps explicit Z and numeric offsets intact", () => {
    expect(parseUtcDate("2024-03-05T10:30:00Z").getTime()).toBe(
      Date.UTC(2024, 2, 5, 10, 30),
    );
    expect(parseUtcDate("2024-03-05T10:30:00+05:00").getTime()).toBe(
      Date.UTC(2024, 2, 5, 5, 30),
    );
  });

  it("treats date-only values as local calendar days", () => {
    const parsed = parseUtcDate("2024-03-05");
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(5);
    expect(parsed.getHours()).toBe(0);
  });
});

describe("day helpers", () => {
  it("formats a local day as YYYY-MM-DD", () => {
    expect(localDayString(new Date(2024, 0, 9, 23, 59))).toBe("2024-01-09");
  });

  it("walks back whole days from midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 2, 10, 15, 0));
    expect(daysAgoString(0)).toBe("2024-03-10");
    expect(daysAgoString(3)).toBe("2024-03-07");
    vi.useRealTimers();
  });

  it("formats dates for display", () => {
    expect(formatDate("2024-03-05")).toMatch(/2024/);
  });
});

describe("greetingForHour", () => {
  it.each([
    [0, "A quiet moment"],
    [4, "A quiet moment"],
    [5, "Good morning"],
    [11, "Good morning"],
    [12, "Good afternoon"],
    [16, "Good afternoon"],
    [17, "Good evening"],
    [20, "Good evening"],
    [21, "Winding down"],
    [23, "Winding down"],
  ])("hour %i -> %s", (hour, expected) => {
    expect(greetingForHour(hour)).toBe(expected);
  });
});

describe("relativeTime", () => {
  it("describes recent timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-05T12:00:00Z"));
    expect(relativeTime("2024-03-05T11:59:40")).toBe("Just now");
    expect(relativeTime("2024-03-05T11:30:00")).toBe("30m ago");
    expect(relativeTime("2024-03-05T10:00:00")).toBe("2h ago");
    expect(relativeTime("2024-03-02T12:00:00")).toBe("3d ago");
    vi.useRealTimers();
  });
});

describe("mood presentation", () => {
  it("maps score boundaries to presentation tones", () => {
    expect(describeMood(1).tone).toBe("very-low");
    expect(describeMood(2).tone).toBe("very-low");
    expect(describeMood(3).tone).toBe("low");
    expect(describeMood(4).tone).toBe("low");
    expect(describeMood(5).tone).toBe("okay");
    expect(describeMood(6).tone).toBe("okay");
    expect(describeMood(7).tone).toBe("good");
    expect(describeMood(8).tone).toBe("good");
    expect(describeMood(9).tone).toBe("great");
    expect(describeMood(10).tone).toBe("great");
  });

  it("builds a complete 1-10 scale", () => {
    expect(MOOD_SCALE).toHaveLength(10);
    expect(MOOD_SCALE[0].score).toBe(1);
    expect(MOOD_SCALE[9].score).toBe(10);
    expect(MOOD_SCALE.every((entry) => entry.label && entry.hint)).toBe(true);
  });
});

describe("describeApiError", () => {
  it("prefers a string detail from the API", () => {
    const error = {
      isAxiosError: true,
      response: { status: 409, data: { detail: "Email already registered" } },
    };
    expect(describeApiError(error)).toEqual({
      status: 409,
      message: "Email already registered",
      isNetworkError: false,
    });
  });

  it("uses friendly copy for validation error arrays", () => {
    const error = {
      isAxiosError: true,
      response: { status: 422, data: { detail: [{ loc: ["body"] }] } },
    };
    expect(describeApiError(error).message).toBe(
      "Please check the information you entered and try again.",
    );
  });

  it("falls back to a message field when detail is absent", () => {
    const error = {
      isAxiosError: true,
      response: { status: 400, data: { message: "Bad request" } },
    };
    expect(describeApiError(error).message).toBe("Bad request");
  });

  it("reports unreachable services as network errors", () => {
    const info = describeApiError({ isAxiosError: true });
    expect(info.isNetworkError).toBe(true);
    expect(info.status).toBeNull();
    expect(info.message).toContain("could not reach");
  });

  it("uses a plain Error message and the fallback for unknown values", () => {
    expect(describeApiError(new Error("boom")).message).toBe("boom");
    expect(describeApiError(null, "Fallback copy").message).toBe("Fallback copy");
  });
});

describe("utils", () => {
  it("joins only truthy class names", () => {
    expect(classNames("a", false, null, undefined, "b")).toBe("a b");
  });

  it("derives initials and first names", () => {
    expect(initials("Ayesha Khan")).toBe("AK");
    expect(initials("Lumi")).toBe("LU");
    expect(initials("   ")).toBe("?");
    expect(firstName("Ayesha Khan")).toBe("Ayesha");
    expect(firstName(null)).toBe("there");
    expect(firstName("   ")).toBe("there");
  });
});
