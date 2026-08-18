import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.AUTH_TOKEN ?? "",
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u00f1\u00e1-\u00fa-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const DELETE_IDS = [
  1, 7, 8, 9, 10, 11, 12, 13, 15, 16, 18, 19, 22, 23, 26, 27, 29, 36, 37, 39,
];

const RENAMED: Record<number, { name: string; description: string }> = {
  2: {
    name: "Hamburguesa Smash Clásica",
    description: "Doble carne de vacuno con queso cheddar y bacon.",
  },
  4: {
    name: "Hamburguesa de Ternera",
    description: "Clásica carne de ternera de 110 gr. con queso cheddar.",
  },
  6: {
    name: "Hamburguesa Angus Premium",
    description: "200 gr. de angus con queso cheddar.",
  },
  5: {
    name: "Triple Smash Deluxe",
    description:
      "Triple carne artesana, queso cheddar, cebolla, bacon y huevo (no personalizable).",
  },
  3: {
    name: "Hamburguesa Trufada",
    description:
      "200 gr. de angus, brotes verdes, virutas de queso curado, huevo y mayonesa trufada.",
  },
  14: {
    name: "Hamburguesa de Pollo Crujiente",
    description: "Pollo rebozado casero con queso.",
  },
  20: {
    name: "Patatas con Toppings",
    description:
      "Patatas fritas con el topping que elijas: bacon crujiente, cheddar fundido o salsa BBQ.",
  },
  21: {
    name: "Ensalada César",
    description:
      "Lechuga romana con pollo a la plancha, crutones, parmesano y nuestra salsa césar casera.",
  },
  24: {
    name: "Croquetas Caseras",
    description:
      "Croquetas caseras crujientes por fuera y cremosas por dentro (8 ud / 4 ud).",
  },
  25: {
    name: "Palitos de Mozzarella",
    description: "10 unidades / 5 unidades.",
  },
  17: {
    name: "Secreto Ibérico con Pimientos",
    description:
      "Tiras de secreto ibérico a la plancha con pimientos de padrón salteados.",
  },
  42: {
    name: "Sándwich Mixto",
    description: "Dos capas de york y queso fundido.",
  },
  41: {
    name: "Sándwich Cubano",
    description: "Dos capas de york, queso y huevo.",
  },
  40: {
    name: "Wrap de Pollo",
    description: "Pollo rebozado, bacon, queso, verdura y salsa kebab.",
  },
  38: {
    name: "Bocadillo al Gusto",
    description:
      "Elige tu relleno entre nuestra selección de embutidos y quesos.",
  },
  35: {
    name: "Mollete al Gusto",
    description: "Mollete andaluz tostado con el relleno que más te apetezca.",
  },
  32: {
    name: "Mini Sándwich Mixto",
    description: "Tostado de jamón y queso, cortado en triángulos.",
  },
  33: {
    name: "Salchipapas",
    description: "Patatas fritas caseras con salchichas de frankfurt.",
  },
  31: {
    name: "Brownie con Helado",
    description: "Brownie de chocolate con una bola de helado de vainilla.",
  },
  30: {
    name: "Tarta de la Semana",
    description: "Nuestra tarta casera cambia cada semana. Pregunta por la de hoy.",
  },
  28: {
    name: "Trufas de Chocolate",
    description:
      "Trufas de chocolate blanco y negro con textura cremosa, servidas bien frías.",
  },
};

async function main() {
  const backup = await client.execute("SELECT * FROM dishes ORDER BY id");
  const backupDir = path.resolve(process.cwd(), "src/data/backups");
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(
    path.join(backupDir, "dishes-backup.json"),
    JSON.stringify(backup.rows, null, 2),
  );
  console.log(`Backup guardado (${backup.rows.length} platos): src/data/backups/dishes-backup.json`);

  for (const id of DELETE_IDS) {
    await client.execute({
      sql: "DELETE FROM dish_allergens WHERE dish_id = ?",
      args: [id],
    });
    await client.execute({ sql: "DELETE FROM dishes WHERE id = ?", args: [id] });
  }
  console.log(`Eliminados ${DELETE_IDS.length} platos: ${DELETE_IDS.join(", ")}`);

  for (const [idStr, data] of Object.entries(RENAMED)) {
    const id = Number(idStr);
    await client.execute({
      sql: "UPDATE dishes SET name = ?, slug = ?, description = ? WHERE id = ?",
      args: [data.name, slugify(data.name), data.description, id],
    });
  }
  console.log(`Renombrados ${Object.keys(RENAMED).length} platos`);

  const after = await client.execute(`
    SELECT d.id, d.name, c.name as category_name
    FROM dishes d JOIN categories c ON d.category_id = c.id
    ORDER BY c."order", d.id
  `);
  console.log(`Platos restantes: ${after.rows.length}`);
  for (const row of after.rows) {
    console.log(`  [${String(row.category_name)}] ${String(row.name)}`);
  }
}

main()
  .then(() => {
    console.log("Carta genérica aplicada correctamente.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });