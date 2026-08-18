import { describe, it, expect } from "vitest";
import { findNewCancellations } from "@components/AdminReservationPanel";
import type { Reservation } from "@components/admin/types";

const base: Omit<Reservation, "id" | "status"> = {
  table_id: 1,
  customer_name: "Cliente",
  customer_phone: null,
  customer_email: null,
  party_size: 2,
  reservation_date: "2026-08-20",
  reservation_time: "20:00",
  created_at: "",
  table_number: 3,
  capacity: 4,
};

function res(id: number, status: string): Reservation {
  return { ...base, id, status };
}

describe("findNewCancellations", () => {
  it("no devuelve nada en la primera carga (prev null)", () => {
    expect(findNewCancellations(null, [res(1, "cancelled")])).toEqual([]);
  });

  it("detecta una reserva que pasó a cancelada", () => {
    const prev = new Map([
      [1, "pending"],
      [2, "confirmed"],
    ]);
    const current = [res(1, "cancelled"), res(2, "confirmed")];
    const result = findNewCancellations(prev, current);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("ignora reservas que ya estaban canceladas antes", () => {
    const prev = new Map([[1, "cancelled"]]);
    expect(findNewCancellations(prev, [res(1, "cancelled")])).toHaveLength(0);
  });

  it("ignora reservas nuevas que aparecen ya canceladas", () => {
    const prev = new Map([[1, "pending"]]);
    expect(
      findNewCancellations(prev, [res(1, "pending"), res(2, "cancelled")]),
    ).toHaveLength(0);
  });

  it("ignora transiciones a completed", () => {
    const prev = new Map([[1, "pending"]]);
    expect(findNewCancellations(prev, [res(1, "completed")])).toHaveLength(0);
  });
});