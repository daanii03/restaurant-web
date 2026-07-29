import type { APIRoute } from "astro";
import { z } from "zod";
import client from "@db/client";
import { verifySession } from "@utils/auth";
import { generateDataJson } from "@db/generate-json";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00f1\u00e1-\u00fa-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const updateDishSchema = z.object({
  id: z.coerce.number().positive(),
  name: z.string().min(1, "El nombre es obligatorio.").max(100, "Máximo 100 caracteres."),
  price: z.coerce
    .number("El precio debe ser un número.")
    .positive("El precio debe ser mayor que 0.")
    .multipleOf(0.01, "El precio puede tener como máximo dos decimales."),
  category_id: z.coerce.number(),
  description: z.string().max(500, "Máximo 500 caracteres.").default(""),
  image: z.string().max(200).default(""),
  allergens: z.array(z.coerce.number()).default([]),
  allergens_without: z.array(z.coerce.number()).default([]),
});

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!verifySession(cookies.get("admin_session")?.value)) {
    return new Response(JSON.stringify({ error: "No tienes permiso." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await request.formData();

    const dataObject = {
      id: formData.get("id"),
      name: formData.get("name"),
      price: formData.get("price"),
      category_id: formData.get("category_id"),
      description: formData.get("description"),
      image: formData.get("image"),
      allergens: formData.getAll("allergens"),
      allergens_without: formData.getAll("allergens_without"),
    };

    const result = updateDishSchema.safeParse(dataObject);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id, name, price, category_id, description, image, allergens, allergens_without } = result.data;

    const slug = slugify(name);

    await client.execute({
      sql: `UPDATE dishes SET name = ?, slug = ?, price = ?, category_id = ?, description = ?, image = ? WHERE id = ?`,
      args: [name, slug, price, category_id, description, image, id],
    });

    await client.execute({
      sql: `DELETE FROM dish_allergens WHERE dish_id = ?`,
      args: [id],
    });

    if (allergens.length > 0) {
      for (const allergenId of allergens) {
        const withoutOption = allergens_without.includes(allergenId) ? 1 : 0;
        await client.execute({
          sql: `INSERT INTO dish_allergens (dish_id, allergen_id, without_option) 
                VALUES (?, ?, ?)`,
          args: [id, allergenId, withoutOption],
        });
      }
    }

    await generateDataJson();

    return redirect("/admin/dashboard");
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500 },
    );
  }
};
