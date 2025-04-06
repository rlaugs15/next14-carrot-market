import z from "zod";
import validator from "validator";
import { tokenExists } from "../auth";

export const phoneSchema = z
  .string()
  .trim()
  .refine((phone) => validator.isMobilePhone(phone, "ko-KR"), "잘못된 전화 형식");

export const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "토큰이 존재하지 않습니다.");
