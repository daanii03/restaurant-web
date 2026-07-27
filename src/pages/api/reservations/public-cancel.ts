import type { APIRoute } from "astro";
import { z } from "zod";
import { findReservationByPhone, updateReservationStatus } from "@db/queries";

const cancelSchema = z.object({
  id: z.coerce.number().int().positive(),
  customer_phone: z.string().min(1, "El teléfono es obligatorio."),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const result = cancelSchema.safeParse(data);

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Datos inválidos." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reservation = await findReservationByPhone(result.data.id, result.data.customer_phone);

    if (!reservation) {
      return new Response(
        JSON.stringify({ error: "No se encontró ninguna reserva con esos datos." }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    if (reservation.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "Esta reserva ya está cancelada." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (reservation.status === "completed") {
      return new Response(
        JSON.stringify({ error: "No se puede cancelar una reserva completada." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await updateReservationStatus(reservation.id, "cancelled");
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
