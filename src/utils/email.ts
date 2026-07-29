import { Resend } from "resend";
import crypto from "node:crypto";

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const CANCEL_SECRET = import.meta.env.CANCEL_SECRET;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEmail(params: {
  to: string;
  customerName: string;
  date: string;
  time: string;
  partySize: number;
  reservationId: number;
}) {
    const token = crypto
        .createHmac("sha256", CANCEL_SECRET)
        .update(String(params.reservationId))
        .digest("hex");

    const cancelURL = `${import.meta.env.PUBLIC_SITE_URL}/cancel-reservation/${params.reservationId}?token=${token}`;

    const html = `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background-color: #18181b; padding: 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; color: #3f3f46; line-height: 1.6; }
          .details { background-color: #f4f4f5; border-radius: 6px; padding: 20px; margin: 20px 0; }
          .details p { margin: 10px 0; font-size: 15px; }
          .footer { text-align: center; padding: 30px; color: #a1a1aa; font-size: 13px; border-top: 1px solid #e4e4e7; }
          .btn-cancel { display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tu Restaurante</h1>
          </div>
          <div class="content">
            <!-- AQUÍ SE INYECTAN LOS DATOS -->
            <p>Hola <strong>${escapeHtml(params.customerName)}</strong>,</p>
            <p>Tu mesa está lista. Hemos confirmado tu reserva en nuestro local. Aquí tienes los detalles:</p>
            
            <div class="details">
              <p>📅 <strong>Fecha:</strong> ${params.date}</p>
              <p>⏰ <strong>Hora:</strong> ${params.time}</p>
              <p>👥 <strong>Personas:</strong> ${params.partySize}</p>
            </div>

            <p>Si te surge algún imprevisto y no puedes asistir, te agradecemos que canceles la reserva para liberar la mesa.</p>
            
            <div style="text-align: center;">
              <!-- AQUÍ SE INYECTA LA URL DE CANCELACIÓN -->
              <a href="${cancelURL}" class="btn-cancel">Cancelar reserva</a>
            </div>
          </div>
          <div class="footer">
            <p>Tu Restaurante &copy; 2026. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    await resend.emails.send({
      from: "Tu Restaurante <onboarding@resend.dev>",
      to: params.to,
      subject: "Reserva confirmada - Tu Restaurante",
      html,
    });
}
