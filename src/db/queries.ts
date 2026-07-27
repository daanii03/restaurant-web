import client from "@db/client";
import type { Category, Allergen, Dish, Reservation, ReservationStatus, RestaurantTable } from "@db/schema";

export type DishFormData = {
    id:number;
    name:string;
    price:number;
    description:string;
    image:string;
    allergens: number[];
    category_id: number;
    allergens_without: number[];
}

export async function getCategories(): Promise<Category[]> {
    const result = await client.execute(`SELECT * FROM categories ORDER BY "order"`);
    return result.rows.map(row => ({
        id:Number(row.id),
        name: String(row.name),
        order: Number(row.order)
    }));
}

export async function getDishesWithAllergens() {
    const result = await client.execute(`
      SELECT 
          d.*, 
          c.name as category_name,
          COALESCE(
              json_group_array(
                  json_object(
                      'id', a.id, 
                      'name', a.name,
                      'without_option', da.without_option
                  )
              ) FILTER (WHERE a.id IS NOT NULL), 
              '[]'
          ) as allergens_json
      FROM dishes d 
      JOIN categories c ON d.category_id = c.id 
      LEFT JOIN dish_allergens da ON d.id = da.dish_id
      LEFT JOIN allergens a ON da.allergen_id = a.id
      GROUP BY d.id
      ORDER BY c."order", d.id
    `);

    type DishAllergenData = { id: number; name: string; without_option: number };

    return result.rows.map(row => ({
        ...row,
        category_name: row.category_name as string,
        allergens: JSON.parse(row.allergens_json as string) as DishAllergenData[]
    })) as unknown as (Dish & { category_name: string; allergens: DishAllergenData[] })[];
}

export async function getDishWithAllergens(dishId:number): Promise<DishFormData | null> {
    const result = await client.execute({
      sql: `SELECT 
            d.*, 
            COALESCE(
                json_group_array(
                    json_object(
                        'id', a.id, 
                        'without_option', da.without_option
                    )
                ) FILTER (WHERE a.id IS NOT NULL), 
                '[]'
            ) as allergens_json
        FROM dishes d 
        LEFT JOIN dish_allergens da ON d.id = da.dish_id
        LEFT JOIN allergens a ON da.allergen_id = a.id
        WHERE d.id = ?
        GROUP BY d.id`,
      args: [dishId],
    });

    const row = result.rows[0];
    if (!row) return null;

    type AllergenData = { id: number; without_option: number };
    const parsedAllergens = JSON.parse(
      row.allergens_json as string,
    ) as AllergenData[];

    return {
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      description: row.description ? String(row.description) : "",
      image: row.image ? String(row.image) : "",
      category_id: Number(row.category_id),

      allergens: parsedAllergens.map((a) => a.id),
      allergens_without: parsedAllergens
        .filter((a) => a.without_option === 1)
        .map((a) => a.id),
    };
}

export async function getAllergens(): Promise<Allergen[]> {
    const result = await client.execute(`SELECT * FROM allergens`)
    return result.rows.map(row => ({
        id:Number(row.id),
        name:String(row.name),
        icon: null
    }))
}

export async function deleteDish(dishId:number) {
    await client.execute({
        sql:"DELETE FROM dishes WHERE id = ?",
        args:[dishId]
    })
}

export async function getUpcomingReservations(): Promise<
  (Reservation & { table_number: number; capacity: number })[]
> {
  const today = new Date().toISOString().split("T")[0];
  const result = await client.execute({
    sql: `SELECT r.*, t.number AS table_number, t.capacity
          FROM reservations r
          JOIN restaurant_tables t ON r.table_id = t.id
          WHERE r.reservation_date >= ?
          ORDER BY r.reservation_date, r.reservation_time`,
    args: [today],
  });
  return result.rows.map((row) => ({
    ...row,
    id: Number(row.id),
    table_id: Number(row.table_id),
    party_size: Number(row.party_size),
    table_number: Number(row.table_number),
    capacity: Number(row.capacity),
  })) as unknown as (Reservation & { table_number: number; capacity: number })[];
}

export async function createReservation(data: {
  table_id: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes?: string;
  status?: ReservationStatus;
}): Promise<number> {
  const result = await client.execute({
    sql: `INSERT INTO reservations (table_id, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, notes, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.table_id,
      data.customer_name,
      data.customer_phone ?? null,
      data.customer_email ?? null,
      data.party_size,
      data.reservation_date,
      data.reservation_time,
      data.notes ?? null,
      data.status ?? "confirmed",
    ],
  });
  return Number(result.lastInsertRowid);
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.max(0, Math.min(23, Math.floor(total / 60)));
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export async function getAvailableTables(date: string, time: string): Promise<RestaurantTable[]> {
  const timeStart = addMinutes(time, -90);
  const timeEnd = addMinutes(time, 90);
  const result = await client.execute({
    sql: `SELECT * FROM restaurant_tables
          WHERE active = 1
          AND id NOT IN (
            SELECT table_id FROM reservations
            WHERE reservation_date = ?
            AND reservation_time >= ?
            AND reservation_time <= ?
            AND status IN ('pending', 'confirmed')
          )
          ORDER BY number`,
    args: [date, timeStart, timeEnd],
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    number: Number(row.number),
    capacity: Number(row.capacity),
    zone: row.zone as string | null,
    active: Number(row.active),
  }));
}

export async function updateReservationStatus(id: number, status: ReservationStatus): Promise<void> {
  await client.execute({
    sql: "UPDATE reservations SET status = ? WHERE id = ?",
    args: [status, id],
  });
}

export async function findReservationByPhone(id: number, phone: string): Promise<Reservation | null> {
  const result = await client.execute({
    sql: "SELECT * FROM reservations WHERE id = ? AND customer_phone = ?",
    args: [id, phone],
  });
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: Number(row.id),
    table_id: Number(row.table_id),
    customer_name: String(row.customer_name),
    customer_phone: row.customer_phone as string | null,
    customer_email: row.customer_email as string | null,
    party_size: Number(row.party_size),
    reservation_date: String(row.reservation_date),
    reservation_time: String(row.reservation_time),
    status: row.status as ReservationStatus,
    notes: row.notes as string | null,
    created_at: String(row.created_at),
  };
}