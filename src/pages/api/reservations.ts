import type { APIRoute } from "astro";
import { z } from "zod";
import { getUpcomingReservations, createReservation, getAvailableTables, updateReservationStatus } from "@db/queries";
import { verifySession } from "@utils/auth";

const phoneRegex = /^(\+34)?[679]\d{8}$/;

const createSchema = z.object({
  customer_name: z.string().min(1, "El nombre es obligatorio."),
  customer_phone: z.string().regex(phoneRegex, "Teléfono inválido. Formato: +34XXXXXXXXX").optional().or(z.literal("")),
  customer_email: z.string().email("Email inválido.").optional().or(z.literal("")),
  party_size: z.coerce.number().int().positive("El número de comensales debe ser mayor que 0."),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida."),
});

export const GET: APIRoute = async ({ cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const reservations = await getUpcomingReservations();
    const today = new Date().toISOString().split("T")[0];
    const todayReservations = reservations.filter((r) => r.reservation_date === today && r.status !== "cancelled");
    const totalToday = todayReservations.length;
    const totalPeople = todayReservations.reduce((sum, r) => sum + r.party_size, 0);
    const totalTables = 15;
    const reservedTableIds = todayReservations
      .filter((r) => r.status === "pending" || r.status === "confirmed")
      .map((r) => r.table_id);
    const freeTables = totalTables - new Set(reservedTableIds).size;

    return new Response(
      JSON.stringify({
        reservations,
        stats: { totalToday, freeTables, totalPeople },
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const result = statusSchema.safeParse(data);

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Datos inválidos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await updateReservationStatus(result.data.id, result.data.status);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let data: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
    }

    const result = createSchema.safeParse(data);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { party_size, reservation_date, reservation_time } = result.data;

    const availableTables = await getAvailableTables(reservation_date, reservation_time);
    const suitableTables = availableTables
      .filter((t) => t.capacity >= party_size)
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No hay mesas disponibles para ese número de comensales en la fecha y hora seleccionadas.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    const table = suitableTables[0];
    const id = await createReservation({ ...result.data, table_id: table.id });
    return new Response(JSON.stringify({ success: true, id, table: table.number }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
