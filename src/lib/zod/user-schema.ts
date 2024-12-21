import z from "zod";
import { passwordRegex } from "../constants";
import validator from "validator";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "1자리 이상 입력해야 합니다." })
    .email({ message: "이메일을 입력해주세요." }),
  password: z.string().regex(passwordRegex, {
    message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
  }),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "잘못된 전화 형식"
  );
export const tokenSchema = z.coerce.number().min(100000).max(999999);
