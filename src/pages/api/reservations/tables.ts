import type { APIRoute } from "astro";
import { getAvailableTables } from "@db/queries";
import { verifySession } from "@utils/auth";

export const GET: APIRoute = async ({ url, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), { status: 403 });
  }

  const date = url.searchParams.get("date");
  const time = url.searchParams.get("time");

  if (!date || !time) {
    return new Response(JSON.stringify({ error: "Faltan parámetros date y time." }), { status: 400 });
  }

  try {
    const tables = await getAvailableTables(date, time);
    return new Response(JSON.stringify({ tables }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
};
