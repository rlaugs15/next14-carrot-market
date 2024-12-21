## zod를 이용한 유효성 검사 에러 처리

#### /app/login/actions.ts

```tsx
"use server";
import { loginSchema } from "@/lib/zod/user-schema";

const passwordRegex = new RegExp(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);

const createAccountSchema = z
  .object({
    username: z
      .string({
        //문자열 스키마를 생성할 때 몇 가지 일반적인 오류 메시지를 사용자 정의할 수 있다.
        required_error: "이름은 필수입니다.",
        invalid_type_error: "이름은 문자만 가능합니다.",
      })
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(10, { message: "사용자 이름은 최대 10자 이하여야 합니다." })
      .refine((username) => username !== "감자칩", {
        message: "감자칩이라는 닉네임은 사용할 수 없습니다.",
      }),
    email: z
      .string()
      .min(1, { message: "1자리 이상 입력해야 합니다." })
      .email({ message: "이메일을 입력해주세요." }),
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

export async function handleForm(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  }
}
```

- **safeParse()**
  parse를 사용할 때 타입이 유효하지 않은 경우 Zod가 에러를 발생시키는 것을 원하지 않는다면, .safeParse를 사용
- **flatten()**
  Zod 스키마 검증 실패 시 생성된 에러 객체를 더 쉽게 처리할 수 있는 형태로 변환  
  issues 배열보다 더 직관적이고 활용하기 쉬운 데이터 구조를 제공

---

#### /app/login.tsx

```tsx
export default function Login() {
  const [state, formAction] = useFormState(handleForm, null);
  console.log("state", state);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <section className="flex flex-col gap-2">
        <CardTitle>어서오세요!</CardTitle>
        <CardDescription>로그인 ID와 패스워드를 입력해주세요!</CardDescription>
      </section>
      <section>
        <form action={formAction} className="flex flex-col gap-3">
          <FormInput
            name="email"
            type="email"
            placeholder="Email"
            required
            errors={state?.fieldErrors?.email}
          />
          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            required
            errors={state?.fieldErrors?.password}
          />
          <FormBtn text="로그인" />
        </form>
  )
}
```

## 데이터 변형(zod는 검증 뿐 아니라 변환도 가능)

- **transform()**
  구문 분석 후 데이터를 변환
- **toLowerCase()**
  소문자로 변환

```tsx
export const createAccountSchema = z
  .object({
    username: z
      .string({
        //문자열 스키마를 생성할 때 몇 가지 일반적인 오류 메시지를 사용자 정의할 수 있다.
        required_error: "이름은 필수입니다.",
        invalid_type_error: "이름은 문자만 가능합니다.",
      })
      .min(3, { message: "사용자 이름은 최소 3자 이상이어야 합니다." })
      .max(10, { message: "사용자 이름은 최대 10자 이하여야 합니다." })
      .refine((username) => username !== "감자칩", {
        message: "감자칩이라는 닉네임은 사용할 수 없습니다.",
      })
      .transform((username) => `🔥${username}🔥`), //닉네임 양쪽에 이모지 추가
    email: z
      .string()
      .min(1, { message: "1자리 이상 입력해야 합니다." })
      .email({ message: "이메일을 입력해주세요." })
      .toLowerCase(), //이메일 결과를 소문자로 변환
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
```
