"use server";

import { passwordRegex } from "@/lib/constants";
import prisma from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/sessions";

const createAccountSchema = z
  .object({
    username: z
      .string({
        required_error: "이름은 필수입니다.",
        invalid_type_error: "이름은 문자만 가능합니다.",
      })
      .toLowerCase()
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(10, { message: "사용자 이름은 최대 10자 이하여야 합니다." }),
    //.transform((username) => `🔥${username}🔥`),
    email: z
      .string()
      .min(1, { message: "1자리 이상 입력해야 합니다." })
      .email({ message: "이메일을 입력해주세요." })
      .toLowerCase(),
    password: z.string().regex(passwordRegex, {
      message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
    }),
    confirm_password: z.string().regex(passwordRegex, {
      message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
    }),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 닉네임입니다.",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "해당 이메일에 이미 등록된 계정이 있습니다.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "비밀번호 확인에 실패했습니다.",
    path: ["confirm_password"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  console.log(cookies());

  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = await createAccountSchema.safeParseAsync(data);
  console.log("result", result);
  if (!result.success) {
    console.log("실패");

    return result.error.flatten();
  } else {
    console.log("성공");
    // 비밀번호 해싱 (솔트 라운드: 12, 해싱 완료까지 대기하기 위해 await 사용)
    const hashPass = await bcrypt.hash(result.data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashPass,
      },
      select: {
        id: true,
      },
    });
    const cookie = await getSession();
    cookie.id = user.id;
    await cookie.save();
    redirect("/profile");
  }
}
