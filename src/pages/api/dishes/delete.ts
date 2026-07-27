import type { APIRoute } from "astro";
import { z } from "zod"
import { deleteDish } from "@db/queries";

const deleteDishSchema = z.object({
    dish_id: z.coerce.number().int().positive()
})

export const POST: APIRoute = async ({request, redirect ,cookies}) =>{
    if (!cookies.has("admin_session")) return new Response("No tienes permiso.", {status: 403});
    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        const validateData = deleteDishSchema.parse(data);

        await deleteDish(validateData.dish_id);
        return redirect("/admin/dashboard");
    } catch (error) {
        if (error instanceof z.ZodError){
            console.error("Intento de manipulación de ID:", error)
            return new Response("El identificador del plato no es válido", { status:400 })
        }
        console.error("Error al borrar", error);
        return new Response("Error interno del servidor", {status:500})
    }
}