import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { z } from "zod";
import { findReservationById, updateReservationStatus } from "@db/queries";

const cancelSchema = z.object({
  id: z.coerce.number().int().positive(),
  token: z.string().min(1),
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

    const { id, token } = result.data;
    const secret = import.meta.env.CANCEL_SECRET;

    const expectedToken = crypto
      .createHmac("sha256", secret)
      .update(String(id))
      .digest();

    const actualToken = Buffer.from(token, "hex");

    if (actualToken.length !== expectedToken.length || !crypto.timingSafeEqual(actualToken, expectedToken)) {
      return new Response(JSON.stringify({ error: "Token inválido." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reservation = await findReservationById(id);

    if (!reservation) {
      return new Response(
        JSON.stringify({ error: "No se encontró la reserva." }),
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
