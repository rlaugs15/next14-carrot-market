"use server";
import { loginSchema } from "@/lib/zod/user-schema";

export async function handleForm(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  }
}
