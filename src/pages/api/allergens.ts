import type { APIRoute } from "astro";
import { z } from "zod";
import { verifySession } from "@utils/auth";
import { getAllergens, createAllergen, updateAllergen, deleteAllergen } from "@db/queries";

export const GET: APIRoute = async () => {
  try {
    const allergens = await getAllergens();
    return new Response(JSON.stringify(allergens), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), { status: 403 });
  }
  try {
    const data = await request.json();
    const name = z.string().min(1, "El nombre es obligatorio.").parse(data.name);
    const id = await createAllergen(name);
    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), { status: 403 });
  }
  try {
    const data = await request.json();
    const schema = z.object({ id: z.coerce.number().int().positive(), name: z.string().min(1) });
    const result = schema.safeParse(data);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), { status: 400 });
    }
    await updateAllergen(result.data.id, result.data.name);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), { status: 403 });
  }
  try {
    const data = await request.json();
    const id = z.coerce.number().int().positive().parse(data.id);
    await deleteAllergen(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
