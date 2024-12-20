import z from "zod";

const passwordRegex = new RegExp(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

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

export const createAccountSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(10, { message: "사용자 이름은 최대 10자 이하여야 합니다." })
      .refine((username) => username === "감자칩", {
        message: "감자칩이라는 닉네임은 사용할 수 없습니다.",
      })
      .transform((username) => `🔥${username}🔥`),
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
  .refine((data) => data.password !== data.confirm_password, {
    message: "비밀번호 확인에 실패했습니다.",
  });
