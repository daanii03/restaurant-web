import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

type DishAllergen = { id: number; name: string; without_option: number };

const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.AUTH_TOKEN ?? "",
});

export async function generateDataJson(dataDir?: string) {
  const dir = dataDir ?? path.resolve(process.cwd(), "src/data");

  const [dishesResult, categoriesResult, allergensResult] = await Promise.all([
    client.execute(`
      SELECT 
        d.*, 
        c.name as category_name,
        COALESCE(
          json_group_array(
            json_object(
              'id', a.id, 
              'name', a.name,
              'without_option', da.without_option
            )
          ) FILTER (WHERE a.id IS NOT NULL), 
          '[]'
        ) as allergens_json
      FROM dishes d 
      JOIN categories c ON d.category_id = c.id 
      LEFT JOIN dish_allergens da ON d.id = da.dish_id
      LEFT JOIN allergens a ON da.allergen_id = a.id
      GROUP BY d.id
      ORDER BY c."order", d.id
    `),
    client.execute(`SELECT * FROM categories ORDER BY "order"`),
    client.execute(`SELECT * FROM allergens`),
  ]);

  const dishes = dishesResult.rows.map((row) => ({
    ...row,
    category_name: row.category_name as string,
    allergens: JSON.parse(row.allergens_json as string) as DishAllergen[],
    allergens_json: undefined,
  }));

  const categories = categoriesResult.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    order: Number(row.order),
  }));

  const allergens = allergensResult.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    icon: null,
  }));

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "dishes.json"), JSON.stringify(dishes, null, 2));
    fs.writeFileSync(path.join(dir, "categories.json"), JSON.stringify(categories, null, 2));
    fs.writeFileSync(path.join(dir, "allergens.json"), JSON.stringify(allergens, null, 2));
  } catch (err) {
    console.warn("No se pudieron escribir los JSON:", err);
  }
}
