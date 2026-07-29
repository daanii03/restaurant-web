import { generateDataJson } from "../db/generate-json.ts";

generateDataJson()
  .then(() => console.log("Datos generados correctamente en src/data/"))
  .catch(console.error);
