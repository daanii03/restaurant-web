import type { APIRoute } from "astro";
import { z } from "zod";
import { createReservation, getAvailableTables } from "@db/queries";

const createSchema = z.object({
  customer_name: z.string().min(1, "El nombre es obligatorio."),
  customer_phone: z.string().min(1, "El teléfono es obligatorio."),
  party_size: z.coerce.number().int().positive("El número de comensales debe ser mayor que 0."),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida."),
  reservation_time: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida."),
  customer_email: z.string().email("Email inválido.").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
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
          error: "No hay mesas disponibles en la fecha y hora seleccionadas.",
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
