import type { APIRoute } from "astro";
import { z } from "zod";
import { verifySession } from "@utils/auth";
import { updateHoursConfig } from "@db/queries";
import { generateDataJson } from "@db/generate-json";
import type { HoursConfig } from "@db/queries";

const slotSchema = z.tuple([z.string(), z.string()]);

const dayConfigSchema = z.object({
  slots: z.array(slotSchema).optional(),
});

const hoursSchema = z.record(z.string(), dayConfigSchema);

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await request.json();
    const result = hoursSchema.safeParse(data);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await updateHoursConfig(result.data as HoursConfig);
    await generateDataJson();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 },
    );
  }
};
