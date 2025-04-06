"use server";

import crypto from "crypto";
import prisma from "@/lib/db";
import { phoneSchema, tokenSchema } from "@/lib/zod/user-schema";
import { redirect } from "next/navigation";

interface ActionState {
  token: boolean;
}

const createToken = async () => {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await prisma.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  //같은 토큰이 존재한다면 다른 유저가 인증을 하는 중이므로 새로 생성
  if (exists) {
    return createToken();
  } else {
    return token;
  }
};

export async function handleForm(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      //이전 토큰 삭제
      await prisma.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      //새 토큰 생성
      const token = await createToken();
      await prisma.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
              },
            },
          },
        },
      });
      //생성된 토큰을 twilio의 sms를 통해 유저에게 전송
      return {
        token: true,
      };
    }
  } else {
    const result = tokenSchema.safeParse(token);
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      redirect("/");
    }
  }
}
