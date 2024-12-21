"use server";

import { passwordRegex } from "@/lib/constants";
import prisma from "@/lib/db";
import { z } from "zod";

const checkUniqueUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  /* if (user) {
    return false;
  } else {
    true;
  } */
  return !Boolean(user);
};

const checkUniqueEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return Boolean(user) === false;
};

const createAccountSchema = z
  .object({
    username: z
      .string({
        required_error: "이름은 필수입니다.",
        invalid_type_error: "이름은 문자만 가능합니다.",
      })
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(10, { message: "사용자 이름은 최대 10자 이하여야 합니다." })
      .refine(checkUniqueUsername, {
        message: "감자칩이라는 닉네임은 사용할 수 없습니다.",
      }),
    //.transform((username) => `🔥${username}🔥`),
    email: z
      .string()
      .min(1, { message: "1자리 이상 입력해야 합니다." })
      .email({ message: "이메일을 입력해주세요." })
      .toLowerCase()
      .refine(checkUniqueEmail, {
        message: "해당 이메일에 이미 등록된 계정이 있습니다",
      }),
    password: z.string().regex(passwordRegex, {
      message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
    }),
    confirm_password: z.string().regex(passwordRegex, {
      message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
    }),
  })
  .refine((data) => data.password !== data.confirm_password, {
    message: "비밀번호 확인에 실패했습니다.",
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
  console.log("username", data.username);

  const result = await createAccountSchema.safeParseAsync(data);
  console.log("result", result);
  if (!result.success) {
    return result.error.flatten();
  } else {
  }
}
