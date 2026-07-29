import type { APIRoute } from "astro";
import { z } from "zod";
import { verifySession } from "@utils/auth";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@db/queries";

const createSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  order: z.coerce.number().int().min(0),
});

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const GET: APIRoute = async () => {
  try {
    const categories = await getCategories();
    return new Response(JSON.stringify(categories), {
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
    const result = createSchema.safeParse(data);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), { status: 400 });
    }
    const id = await createCategory(result.data.name, result.data.order);
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
    const result = updateSchema.safeParse(data);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), { status: 400 });
    }
    const { id, ...fields } = result.data;
    if (fields.name || fields.order !== undefined) {
      await updateCategory(id, fields.name ?? "", fields.order ?? 0);
    }
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
    await deleteCategory(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
