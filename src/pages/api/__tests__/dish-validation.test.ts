import { describe, it, expect } from "vitest";
import { z } from "zod/v4";

const createDishSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.coerce.number().positive().multipleOf(0.01),
  category_id: z.coerce.number(),
  description: z.string().max(500).default(""),
  image: z.string().max(200).default(""),
  allergens: z.array(z.coerce.number()).default([]),
  allergens_without: z.array(z.coerce.number()).default([]),
});

const updateDishSchema = z.object({
  id: z.coerce.number().positive(),
  name: z.string().min(1).max(100),
  price: z.coerce.number().positive().multipleOf(0.01),
  category_id: z.coerce.number(),
  description: z.string().max(500).default(""),
  image: z.string().max(200).default(""),
  allergens: z.array(z.coerce.number()).default([]),
  allergens_without: z.array(z.coerce.number()).default([]),
});

describe("dish API validation", () => {
  describe("createDishSchema", () => {
    it("accepts valid dish data", () => {
      const result = createDishSchema.safeParse({
        name: "Hamburguesa Clásica",
        price: 12.5,
        category_id: 1,
      });
      expect(result.success).toBe(true);
    });

    it("accepts dish with all fields", () => {
      const result = createDishSchema.safeParse({
        name: "Hamburguesa BBQ",
        price: 14.0,
        category_id: 1,
        description: "Con salsa BBQ",
        image: "bbq.jpg",
        allergens: [1, 3],
        allergens_without: [1],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Con salsa BBQ");
        expect(result.data.allergens).toEqual([1, 3]);
      }
    });

    it("applies defaults for optional fields", () => {
      const result = createDishSchema.safeParse({
        name: "Test",
        price: 5,
        category_id: 1,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("");
        expect(result.data.image).toBe("");
        expect(result.data.allergens).toEqual([]);
        expect(result.data.allergens_without).toEqual([]);
      }
    });

    it("rejects empty name", () => {
      const result = createDishSchema.safeParse({
        name: "",
        price: 10,
        category_id: 1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects name over 100 chars", () => {
      const result = createDishSchema.safeParse({
        name: "A".repeat(101),
        price: 10,
        category_id: 1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero price", () => {
      const result = createDishSchema.safeParse({
        name: "Test",
        price: 0,
        category_id: 1,
      });
      expect(result.success).toBe(false);
    });

    it("coerces string price to number", () => {
      const result = createDishSchema.safeParse({
        name: "Test",
        price: "15.99",
        category_id: "1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(15.99);
      }
    });
  });

  describe("updateDishSchema", () => {
    it("requires id field", () => {
      const result = updateDishSchema.safeParse({
        name: "Test",
        price: 10,
        category_id: 1,
      });
      expect(result.success).toBe(false);
    });

    it("accepts full update data", () => {
      const result = updateDishSchema.safeParse({
        id: 5,
        name: "Updated",
        price: 11.5,
        category_id: 2,
        description: "New desc",
        image: "new.jpg",
        allergens: [],
        allergens_without: [],
      });
      expect(result.success).toBe(true);
    });
  });
});
