import { describe, it, expect } from "vitest";
import { getAvailableHours } from "../hours";

describe("getAvailableHours", () => {
  it("returns empty array for empty date", () => {
    expect(getAvailableHours("")).toEqual([]);
  });

  it("returns empty array for Monday (closed)", () => {
    const monday = "2026-07-27";
    const day = new Date(monday + "T12:00:00").getDay();
    expect(day).toBe(1);
    expect(getAvailableHours(monday)).toEqual([]);
  });

  it("returns morning slots for Tuesday (single slot 07:30-16:00, last at 15:00)", () => {
    const tuesday = "2026-07-28";
    const result = getAvailableHours(tuesday);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toBe("07:30");
    expect(result[result.length - 1]).toBe("15:00");
  });

  it("returns slots for Sunday (two slots, last at 15:00 and 22:30)", () => {
    const sunday = "2026-08-02";
    const day = new Date(sunday + "T12:00:00").getDay();
    expect(day).toBe(0);
    const result = getAvailableHours(sunday);
    expect(result).toContain("07:30");
    expect(result).toContain("15:00");
    expect(result).toContain("20:00");
    expect(result).toContain("22:30");
  });

  it("last slot is always 1 hour before closing in each slot range", () => {
    const saturday = "2026-08-01";
    const result = getAvailableHours(saturday);
    expect(result).toContain("15:00");
    expect(result).toContain("22:30");
    expect(result).not.toContain("16:00");
    expect(result).not.toContain("23:30");
  });

  it("generates 30-minute intervals correctly", () => {
    const friday = "2026-07-31";
    const result = getAvailableHours(friday);
    for (const time of result) {
      const [, m] = time.split(":").map(Number);
      expect(m % 30).toBe(0);
    }
  });

  it("does not include closing time as an available slot", () => {
    const wednesday = "2026-07-29";
    const result = getAvailableHours(wednesday);
    expect(result).not.toContain("16:00");
  });

  it("returns slots in ascending order", () => {
    const sunday = "2026-08-02";
    const result = getAvailableHours(sunday);
    for (let i = 1; i < result.length; i++) {
      expect(result[i] > result[i - 1]).toBe(true);
    }
  });
});
