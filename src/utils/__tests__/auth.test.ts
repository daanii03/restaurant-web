import { describe, it, expect } from "vitest";
import { verifySession, createSessionCookieValue } from "../auth";

describe("auth", () => {
  describe("verifySession", () => {
    it("returns false for undefined", () => {
      expect(verifySession(undefined)).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(verifySession("")).toBe(false);
    });

    it("returns false for malformed cookie (no dot)", () => {
      expect(verifySession("abc")).toBe(false);
    });

    it("returns false for invalid HMAC", () => {
      expect(verifySession("session-id.invalid-hmac")).toBe(false);
    });

    it("returns true for valid session", () => {
      const cookie = createSessionCookieValue();
      expect(verifySession(cookie)).toBe(true);
    });

    it("returns false for tampered session", () => {
      const cookie = createSessionCookieValue();
      const [sessionId] = cookie.split(".");
      const tampered = sessionId + ".tampered";
      expect(verifySession(tampered)).toBe(false);
    });
  });

  describe("createSessionCookieValue", () => {
    it("returns a string with sessionId.hmac format", () => {
      const cookie = createSessionCookieValue();
      expect(cookie).toContain(".");
      const parts = cookie.split(".");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeTruthy();
      expect(parts[1]).toBeTruthy();
    });

    it("generates unique values each call", () => {
      const a = createSessionCookieValue();
      const b = createSessionCookieValue();
      expect(a).not.toBe(b);
    });
  });
});
