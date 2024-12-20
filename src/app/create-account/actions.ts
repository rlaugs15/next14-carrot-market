"use server";

import { createAccountSchema } from "@/lib/zod/user-schema";

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
  const result = createAccountSchema.safeParse(data);
  if (!result.success) {
    console.log("에러 결과", result.error.flatten());

    return result.error.flatten();
  }
}
