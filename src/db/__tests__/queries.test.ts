import { describe, it, expect, vi, beforeEach } from "vitest";

const executeMock = vi.fn();

vi.mock("@libsql/client", () => ({
  createClient: vi.fn(() => ({
    execute: executeMock,
  })),
}));

vi.mock("@db/client", () => ({
  default: { execute: executeMock },
}));

const queries = await import("../queries");

function makeRow(overrides: Record<string, unknown> = {}) {
  const row: Record<string, unknown> = { ...overrides };
  return row;
}

describe("queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("returns mapped categories", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({ id: 1, name: "Carnes", order: 1 }),
          makeRow({ id: 2, name: "Bebidas", order: 2 }),
        ],
      });
      const result = await queries.getCategories();
      expect(result).toEqual([
        { id: 1, name: "Carnes", order: 1 },
        { id: 2, name: "Bebidas", order: 2 },
      ]);
      expect(executeMock).toHaveBeenCalledWith(
        'SELECT * FROM categories ORDER BY "order"',
      );
    });

    it("returns empty array when no categories", async () => {
      executeMock.mockResolvedValue({ rows: [] });
      const result = await queries.getCategories();
      expect(result).toEqual([]);
    });
  });

  describe("createCategory", () => {
    it("inserts and returns the new id", async () => {
      executeMock.mockResolvedValue({ lastInsertRowid: 5 });
      const id = await queries.createCategory("Test", 3);
      expect(id).toBe(5);
      expect(executeMock).toHaveBeenCalledWith({
        sql: 'INSERT INTO categories (name, "order") VALUES (?, ?)',
        args: ["Test", 3],
      });
    });
  });

  describe("getAllergens", () => {
    it("returns mapped allergens", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({ id: 1, name: "Gluten" }),
          makeRow({ id: 2, name: "Lacteos" }),
        ],
      });
      const result = await queries.getAllergens();
      expect(result).toEqual([
        { id: 1, name: "Gluten", icon: null },
        { id: 2, name: "Lacteos", icon: null },
      ]);
    });
  });

  describe("createAllergen", () => {
    it("inserts and returns the new id", async () => {
      executeMock.mockResolvedValue({ lastInsertRowid: 10 });
      const id = await queries.createAllergen("Nuevo");
      expect(id).toBe(10);
      expect(executeMock).toHaveBeenCalledWith({
        sql: "INSERT INTO allergens (name) VALUES (?)",
        args: ["Nuevo"],
      });
    });
  });

  describe("getDishesWithAllergens", () => {
    it("returns dishes with parsed allergens", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({
            id: 1,
            name: "Hamburguesa",
            price: 12,
            category_id: 1,
            category_name: "Carnes",
            allergens_json: JSON.stringify([
              { id: 1, name: "Gluten", without_option: 0 },
            ]),
          }),
        ],
      });
      const result = await queries.getDishesWithAllergens();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Hamburguesa");
      expect(result[0].category_name).toBe("Carnes");
      expect(result[0].allergens).toHaveLength(1);
      expect(result[0].allergens[0].name).toBe("Gluten");
      expect(result[0].allergens[0].without_option).toBe(0);
    });
  });

  describe("getDishWithAllergens", () => {
    it("returns structured form data for a dish", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({
            id: 1,
            name: "Hamburguesa",
            price: 12,
            description: "Rica hamburguesa",
            image: "burger.jpg",
            category_id: 1,
            allergens_json: JSON.stringify([
              { id: 1, without_option: 1 },
              { id: 2, without_option: 0 },
            ]),
          }),
        ],
      });
      const result = await queries.getDishWithAllergens(1);
      expect(result).not.toBeNull();
      expect(result!.name).toBe("Hamburguesa");
      expect(result!.allergens).toEqual([1, 2]);
      expect(result!.allergens_without).toEqual([1]);
    });

    it("returns null when dish not found", async () => {
      executeMock.mockResolvedValue({ rows: [] });
      const result = await queries.getDishWithAllergens(999);
      expect(result).toBeNull();
    });
  });

  describe("getAvailableTables", () => {
    it("returns mapped tables", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({ id: 1, number: 5, capacity: 4, zone: "interior", active: 1 }),
          makeRow({ id: 2, number: 6, capacity: 6, zone: null, active: 1 }),
        ],
      });
      const result = await queries.getAvailableTables("2026-08-01", "20:00");
      expect(result).toHaveLength(2);
      expect(result[0].number).toBe(5);
      expect(result[1].zone).toBeNull();
    });
  });

  describe("findReservationById", () => {
    it("returns reservation when found", async () => {
      executeMock.mockResolvedValue({
        rows: [
          makeRow({
            id: 1,
            table_id: 3,
            customer_name: "Juan",
            customer_phone: "555",
            customer_email: null,
            party_size: 4,
            reservation_date: "2026-08-01",
            reservation_time: "20:00",
            status: "confirmed",
            created_at: "2026-07-29T12:00:00Z",
          }),
        ],
      });
      const result = await queries.findReservationById(1);
      expect(result).not.toBeNull();
      expect(result!.customer_name).toBe("Juan");
      expect(result!.status).toBe("confirmed");
    });

    it("returns null when not found", async () => {
      executeMock.mockResolvedValue({ rows: [] });
      const result = await queries.findReservationById(999);
      expect(result).toBeNull();
    });
  });

  describe("createReservation", () => {
    it("inserts with correct defaults", async () => {
      executeMock.mockResolvedValue({ lastInsertRowid: 42 });
      const id = await queries.createReservation({
        table_id: 1,
        customer_name: "Ana",
        party_size: 2,
        reservation_date: "2026-08-01",
        reservation_time: "21:00",
      });
      expect(id).toBe(42);
      const call = executeMock.mock.calls[0][0];
      expect(call.sql).toContain("INSERT INTO reservations");
      expect(call.args).toContain("Ana");
      expect(call.args).toContain("confirmed");
    });
  });

  describe("updateReservationStatus", () => {
    it("updates status", async () => {
      executeMock.mockResolvedValue({});
      await queries.updateReservationStatus(1, "cancelled");
      expect(executeMock).toHaveBeenCalledWith({
        sql: "UPDATE reservations SET status = ? WHERE id = ?",
        args: ["cancelled", 1],
      });
    });
  });

  describe("getActiveTableCount", () => {
    it("returns the count", async () => {
      executeMock.mockResolvedValue({ rows: [makeRow({ count: 15 })] });
      const count = await queries.getActiveTableCount();
      expect(count).toBe(15);
    });
  });

  describe("getHoursConfig", () => {
    it("returns parsed config when found", async () => {
      const config = { "0": { slots: [["07:30", "16:00"]] } };
      executeMock.mockResolvedValue({
        rows: [makeRow({ value: JSON.stringify(config) })],
      });
      const result = await queries.getHoursConfig();
      expect(result).toEqual(config);
    });

    it("returns null when no config", async () => {
      executeMock.mockResolvedValue({ rows: [] });
      const result = await queries.getHoursConfig();
      expect(result).toBeNull();
    });
  });

  describe("updateReservation", () => {
    it("builds dynamic SQL for partial update", async () => {
      executeMock.mockResolvedValue({});
      await queries.updateReservation(1, {
        customer_name: "Pedro",
        party_size: 6,
      });
      const call = executeMock.mock.calls[0][0];
      expect(call.sql).toContain("customer_name = ?");
      expect(call.sql).toContain("party_size = ?");
      expect(call.args).toContain("Pedro");
      expect(call.args).toContain(6);
      expect(call.args).toContain(1);
    });

    it("does nothing when no fields to update", async () => {
      await queries.updateReservation(1, {});
      expect(executeMock).not.toHaveBeenCalled();
    });
  });
});
