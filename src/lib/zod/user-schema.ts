import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "1자리 이상 입력해야 합니다." })
    .email({ message: "이메일을 입력해주세요." }),
  password: z.string().regex(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: " 8자리 이상이며, 특수문자가 1개 이상 포함되어야 합니다.",
  }),
});

export type LoginForm = z.infer<typeof loginSchema>;
