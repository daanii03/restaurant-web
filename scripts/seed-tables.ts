import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.AUTH_TOKEN ?? "",
});

const tables = [
  { number: 1,  capacity: 2,  zone: "Interior" },
  { number: 2,  capacity: 2,  zone: "Interior" },
  { number: 3,  capacity: 4,  zone: "Interior" },
  { number: 4,  capacity: 4,  zone: "Interior" },
  { number: 5,  capacity: 4,  zone: "Interior" },
  { number: 6,  capacity: 6,  zone: "Interior" },
  { number: 7,  capacity: 6,  zone: "Interior" },
  { number: 8,  capacity: 2,  zone: "Terraza" },
  { number: 9,  capacity: 2,  zone: "Terraza" },
  { number: 10, capacity: 4,  zone: "Terraza" },
  { number: 11, capacity: 4,  zone: "Terraza" },
  { number: 12, capacity: 4,  zone: "Terraza" },
  { number: 13, capacity: 6,  zone: "Terraza" },
  { number: 14, capacity: 8,  zone: "Salón Privado" },
  { number: 15, capacity: 10, zone: "Salón Privado" },
];

for (const table of tables) {
  await client.execute({
    sql: `INSERT INTO restaurant_tables (number, capacity, zone) VALUES (?, ?, ?)`,
    args: [table.number, table.capacity, table.zone],
  });
  console.log(`Mesa ${table.number} (${table.capacity} pers, ${table.zone}) creada`);
}

console.log("Seed completado ✅");
