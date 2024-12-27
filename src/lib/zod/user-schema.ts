import z from "zod";
import { passwordRegex } from "../constants";
import validator from "validator";

export const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "잘못된 전화 형식"
  );
export const tokenSchema = z.coerce.number().min(100000).max(999999);
