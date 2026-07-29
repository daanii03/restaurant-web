import type { APIRoute } from "astro";
import { z } from "zod";
import { verifySession } from "@utils/auth";
import { getAllTables, getActiveTableCount, createTable, updateTable, deleteTable } from "@db/queries";

const createSchema = z.object({
  number: z.coerce.number().int().positive("El número debe ser positivo."),
  capacity: z.coerce.number().int().positive("La capacidad debe ser positiva."),
  zone: z.string().optional(),
});

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  number: z.coerce.number().int().positive().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  zone: z.string().nullable().optional(),
  active: z.coerce.number().int().min(0).max(1).optional(),
});

export const GET: APIRoute = async ({ cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), { status: 403 });
  }
  try {
    const tables = await getAllTables();
    const activeCount = await getActiveTableCount();
    return new Response(JSON.stringify({ tables, activeCount }), {
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
    const id = await createTable(result.data);
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
    await updateTable(id, fields);
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
    await deleteTable(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
