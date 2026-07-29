import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.AUTH_TOKEN ?? "",
});

const defaultHours = {
  "0": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
  "1": { closed: true },
  "2": { slots: [["07:30", "16:00"]] },
  "3": { slots: [["07:30", "16:00"]] },
  "4": { slots: [["07:30", "16:00"]] },
  "5": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
  "6": { slots: [["07:30", "16:00"], ["20:00", "23:30"]] },
};

await client.execute(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);

await client.execute({
  sql: `INSERT OR IGNORE INTO settings (key, value) VALUES ('hours', ?)`,
  args: [JSON.stringify(defaultHours)],
});

const result = await client.execute(`SELECT * FROM settings`);
console.log(result.rows);

console.log("Tabla settings creada y datos por defecto insertados.");
process.exit(0);
