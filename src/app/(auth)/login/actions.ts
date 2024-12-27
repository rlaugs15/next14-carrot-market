"use server";
import { passwordRegex } from "@/lib/constants";
import prisma from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";

const checkEmailExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
};

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "1자리 이상 입력해야 합니다." })
    .email({ message: "이메일을 입력해주세요." })
    .refine(checkEmailExists, "이 이메일을 사용하는 계정이 존재하지 않습니다."),
  password: z.string().regex(passwordRegex, {
    message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
  }),
});

export async function handleForm(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = await loginSchema.safeParseAsync(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const user = await prisma.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "xxxx"
    );
    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      redirect("/profile");
    } else {
      return {
        fieldErrors: {
          password: ["잘못된 비밀번호입니다."],
          email: [],
        },
      };
    }
  }
}
