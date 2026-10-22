// Cuenta de demostración para la evaluación: solo la importa la página de login (Server Component), así que
// ni las variables ni este módulo llegan al bundle del cliente. Se quita cuando termine la evaluación.
import { z } from "zod";

// Vacía es lo mismo que no definida: así se apaga en Vercel sin borrar la variable
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const demoLoginSchema = z.object({
  DEMO_LOGIN_EMAIL: optional(z.email()),
  DEMO_LOGIN_PASSWORD: optional(z.string()),
});

export type DemoLogin = { email: string; password: string };

/** Las dos variables o ninguna: con una sola el login sale vacío, como siempre. */
export function readDemoLogin(env: Record<string, string | undefined>): DemoLogin | null {
  const { DEMO_LOGIN_EMAIL: email, DEMO_LOGIN_PASSWORD: password } = demoLoginSchema.parse(env);
  return email && password ? { email, password } : null;
}
