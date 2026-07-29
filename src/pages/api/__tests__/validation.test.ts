import { describe, it, expect } from "vitest";
import { z } from "zod/v4";

const phoneRegex = /^(\+34)?[679]\d{8}$/;

const createReservationSchema = z.object({
  customer_name: z.string().min(1),
  customer_phone: z.string().regex(phoneRegex).optional().or(z.literal("")),
  customer_email: z.string().email().optional().or(z.literal("")),
  party_size: z.coerce.number().int().positive(),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

describe("reservation API validation", () => {
  describe("createReservationSchema", () => {
    it("accepts valid reservation data", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Juan Pérez",
        party_size: 4,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
      });
      expect(result.success).toBe(true);
    });

    it("accepts reservation with phone and email", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Ana",
        customer_phone: "+34600123456",
        customer_email: "ana@example.com",
        party_size: 2,
        reservation_date: "2026-08-15",
        reservation_time: "21:30",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty customer name", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "",
        party_size: 4,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
      });
      expect(result.success).toBe(false);
    });

    it("rejects party_size of 0", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 0,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 2,
        reservation_date: "01-08-2026",
        reservation_time: "20:00",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid time format", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 2,
        reservation_date: "2026-08-01",
        reservation_time: "8:00",
      });
      expect(result.success).toBe(false);
    });

    it("accepts empty phone", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 2,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
        customer_phone: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid spanish phone", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 2,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
        customer_phone: "123456789",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid spanish phone without prefix", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: 2,
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
        customer_phone: "612345678",
      });
      expect(result.success).toBe(true);
    });

    it("coerces string party_size to number", () => {
      const result = createReservationSchema.safeParse({
        customer_name: "Test",
        party_size: "4",
        reservation_date: "2026-08-01",
        reservation_time: "20:00",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.party_size).toBe(4);
      }
    });
  });

  describe("loginSchema", () => {
    it("accepts valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "admin@turestaurante.com",
        password: "secret123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "secret123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "admin@turestaurante.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing password field", () => {
      const result = loginSchema.safeParse({
        email: "admin@turestaurante.com",
      });
      expect(result.success).toBe(false);
    });
  });
});
