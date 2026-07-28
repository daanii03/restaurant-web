import type { APIRoute } from "astro";
import { z } from "zod";
import client from "@db/client";
import { verifySession } from "@utils/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00f1\u00e1-\u00fa-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const createDishSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio.").max(100, "Máximo 100 caracteres."),
  price: z.coerce
    .number("El precio debe ser un número.")
    .positive("El precio debe ser mayor que 0.")
    .multipleOf(0.01, "El precio puede tener como máximo dos decimales."),
  category_id: z.coerce.number(),
  description: z.string().max(500, "Máximo 500 caracteres.").default(""),
  allergens: z.array(z.coerce.number()).default([]),
  allergens_without: z.array(z.coerce.number()).default([]),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await request.formData();

    const dataObject = {
      name: formData.get("name"),
      price: formData.get("price"),
      category_id: formData.get("category_id"),
      description: formData.get("description"),
      allergens: formData.getAll("allergens"),
      allergens_without: formData.getAll("allergens_without"),
    };

    const result = createDishSchema.safeParse(dataObject);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      name,
      price,
      category_id,
      description,
      allergens,
      allergens_without,
    } = result.data;

    const slug = slugify(name);

    const insertResult = await client.execute({
      sql: `INSERT INTO dishes (name, slug, price, category_id, description) VALUES (?, ?, ?, ?, ?)`,
      args: [name, slug, price, category_id, description],
    });

    const dishId = Number(insertResult.lastInsertRowid);

    if (allergens.length > 0) {
      for (const allergenId of allergens) {
        const withoutOption = allergens_without.includes(allergenId) ? 1 : 0;
        await client.execute({
          sql: `INSERT INTO dish_allergens (dish_id, allergen_id, without_option) VALUES (?, ?, ?)`,
          args: [dishId, allergenId, withoutOption],
        });
      }
    }

    return new Response(JSON.stringify({ success: true, id: dishId }), {
      status: 200,
    });
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 },
    );
  }
};
