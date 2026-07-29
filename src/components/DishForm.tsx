import { useState } from "react";
import Input from "@components/Input";

interface DishData {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category_id: number;
  allergens: number[];
  allergens_without: number[];
}

interface DishFormProps {
  dish?: DishData;
  categories: {
    id: number;
    name: string;
  }[];
  allAllergens: {
    id: number;
    name: string;
  }[];
}

const emptyDish: DishData = {
  id: 0,
  name: "",
  price: 0,
  description: "",
  image: "",
  category_id: 0,
  allergens: [],
  allergens_without: [],
};

export function DishForm({
  dish,
  categories,
  allAllergens,
}: DishFormProps) {
  const isEdit = Boolean(dish);
  const initial = dish ?? emptyDish;

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    text: string;
  }>({ type: "idle", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "loading", text: "Guardando..." });

    const formData = new FormData(e.currentTarget);
    const endpoint = isEdit ? "/api/dishes/update-dish" : "/api/dishes/create-dish";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          text: isEdit ? "Plato actualizado con éxito" : "Plato creado con éxito",
        });
      } else {
        const errorText =
          typeof data.error === "object"
            ? "Revisa los campos del formulario. Los datos no son válidos."
            : data.error || "Error al procesar el plato.";

        setStatus({ type: "error", text: errorText });
      }
    } catch (error) {
      setStatus({ type: "error", text: "Error de conexión con el servidor." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}

      <Input
        id="name"
        name="name"
        labelText="Nombre del plato"
        type="text"
        defaultValue={initial.name}
        required
      />

      <Input
        id="price"
        name="price"
        labelText="Precio (€)"
        type="number"
        step="0.01"
        defaultValue={initial.price > 0 ? initial.price.toString() : ""}
        required
      />

      <div className="flex flex-col gap-2 py-4 w-full">
        <label htmlFor="category_id" className="text-primary font-bold">
          Categoría
        </label>
        <select
          id="category_id"
          name="category_id"
          className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark appearance-none"
          defaultValue={initial.category_id || ""}
          required
        >
          <option value="" disabled>
            Selecciona una categoría...
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="image"
        name="image"
        labelText="Nombre del archivo de imagen"
        type="text"
        defaultValue={initial.image}
        placeholder="ej: hamburguesa.webp"
      />

      <div className="flex flex-col gap-2 py-4 w-full">
        <label htmlFor="description" className="text-primary font-bold">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="text-primary bg-elevated border border-muted/40 rounded-sm p-2 outline-none focus:border-primary/80 transition-colors scheme-dark"
          defaultValue={initial.description}
        />
      </div>

      <div className="flex flex-col gap-2 py-4 w-full border-t border-muted/40 mt-2">
        <label className="text-primary font-bold mb-2">
          Alérgenos y Opciones
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAllergens.map((allergen) => (
            <div
              key={allergen.id}
              className="flex flex-col gap-2 p-3 bg-elevated border border-muted/20 rounded-sm"
            >
              <label className="flex items-center gap-3 cursor-pointer text-primary hover:text-accent-light transition-colors">
                <input
                  type="checkbox"
                  name="allergens"
                  value={allergen.id}
                  defaultChecked={initial.allergens.includes(allergen.id)}
                  className="w-5 h-5 accent-brand-red cursor-pointer bg-card border-muted/40"
                />
                <span className="font-bold select-none">{allergen.name}</span>
              </label>

              <label className="flex items-center gap-3 ml-8 cursor-pointer text-muted-foreground hover:text-primary transition-colors text-sm">
                <input
                  type="checkbox"
                  name="allergens_without"
                  value={allergen.id}
                  defaultChecked={initial.allergens_without.includes(allergen.id)}
                  className="w-4 h-4 accent-accent-light cursor-pointer bg-card border-muted/40"
                />
                <span className="select-none text-primary">
                  Opción "Sin {allergen.name}"
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {status.type !== "idle" && (
        <div
          className={`text-center font-bold p-3 mt-2 rounded-sm border transition-colors ${
            status.type === "success"
              ? "bg-green-900/40 text-green-400 border-green-500/50"
              : status.type === "error"
                ? "bg-red-900/40 text-brand-red border-brand-red/50"
                : "bg-muted/40 text-primary border-muted/40"
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        type="submit"
        disabled={status.type === "loading"}
        className="text-primary font-bold bg-transparent border border-brand-red hover:bg-brand-red disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 rounded-sm p-4 w-full mt-4 mb-4"
      >
        {status.type === "loading"
          ? "GUARDANDO..."
          : isEdit
            ? "GUARDAR CAMBIOS"
            : "CREAR PLATO"}
      </button>
    </form>
  );
}
