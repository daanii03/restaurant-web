import type { APIRoute } from "astro";
import client from "@db/client";
import bcrypt from "bcryptjs"
import { z } from "zod"
import { createSessionCookieValue } from "@utils/auth";

const loginSchema = z.object({
    email: z.string().email("Debe ser un email válido."),
    password: z.string().min(1, "La contraseña es obligatoria.")
});

export const POST: APIRoute = async ({request, redirect, cookies}) => {
    const formData = await request.formData();
    const formObject = Object.fromEntries(formData)
    const result = loginSchema.safeParse(formObject)
    if (!result.success) {
        const exactErrorMessage = result.error.issues[0].message;
        return redirect(`/admin?error=${encodeURIComponent(exactErrorMessage)}`);
    }

    const { email, password } = result.data;

    try {
        const result = await client.execute({
            sql: "SELECT * FROM admins WHERE email = ?",
            args: [email]
        })

        const user = result.rows[0]

        if (user && bcrypt.compareSync(password, user.password_hash as string)){
            cookies.set("admin_session", createSessionCookieValue(), {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 60 * 60 * 24
            });

            return redirect("/admin/dashboard")
        }
        else
            return redirect("/admin?error=invalid_credentials")

    } catch(error) {
        console.error("Error en el login:", error)
        return new Response("Error interno del servidor", {status: 500});
    }
}
