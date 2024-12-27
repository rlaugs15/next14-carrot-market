# Server Actions

#### Server Actions이란?

- "use server"로 선언된 함수이며, Client Component에서도 호출할 수 있다.
- 함수나 파일에 작성해 두면, 함수 내용을 자동으로 서버 API로 만들어주고, 개발자는 유저에게 코드가 노출될 걱정 없이 자유롭게 데이터베이스를 관리할 수 있다.

> 리액트 쿼리의 인자로 들어가는 axios나 fetch 요청 함수를 작성할 때 유용할 것 같다.

### 목차

- [Route Handlers](/docs/server-actions.md/#route-handlers)
- [Server actions](/docs/server-actions.md/#server-actions)
- [useFormState(useFormState -> useActionState로 변경)](/docs/server-actions.md/#useformstateuseformstate---useactionstate로-변경)

# 유효성 검사(Validation)

### 목차

- [zod를 이용한 유효성 검사 에러 처리](/docs/validation.md/#zod를-이용한-유효성-검사-에러-처리)
- [데이터 변형(zod는 검증 뿐 아니라 변환도 가능)](/docs/validation.md/#데이터-변형zod는-검증-뿐-아니라-변환도-가능)

# 프리즈마ORM

### 목차

- [초기 세팅](/docs/prisma.md/#초기-세팅)
- [Schemas 및 프리즈마 스튜디오](/docs/prisma.md/#schemas-및-프리즈마-스튜디오)
- [Prisma Client 및 테스트(데이터베이스 쿼리 단계)](/docs/prisma.md/#prisma-client-및-테스트데이터베이스-쿼리-단계)

# 인증(Authentication)

## DB 유효성 검사(프리즈마 쿼리의 유효성 검사를 zod로)

유효성 검사를 할 곳은 zod이기에 리팩토링

```typescript
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
  .refine((data) => data.password === data.confirm_password, {
    message: "비밀번호 확인에 실패했습니다.",
    path: ["confirm_password"], //confirm_password에 에러출력
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
```

### const result = await createAccountSchema.safeParseAsync(data);

#### safeParse의 비동기 버전인 safeParseAsync로 바꾼 이유

- **safeParseAsync**

  - Zod 스키마를 사용하여 비동기 데이터를 검증할 때 사용하는 함수
  - 주로 비동기 작업 결과를 검증해야 하거나, Promise를 반환하는 데이터 소스를 다룰 때 유용
  - 유효성 검사를 수행한 결과를 성공(success: true) 또는 실패(success: false)를 나타내는 객체로 반환
  - 데이터 검증이 성공하면 data 속성을, 실패하면 error 속성을 제공
  - **반환타입:**

  ```typescript
  type SafeParseReturnType<T> =
    | { success: true; data: T }
    | { success: false; error: ZodError };
  ```

#### safeParse vs safeParseAsync

- **safeParse:** 스키마 검증이 동기적으로만 이루어질 때 사용
- **safeParseAsync:** 스키마 검증 과정에서 비동기 작업(예: 데이터베이스 조회, API 호출 등)이 포함될 때 사용

```typescript
//safeParseAsync 사용 전
.refine(await checkUniqueEmail(email), {
       message: "해당 이메일에 이미 등록된 계정이 있습니다",
     }),

//safeParseAsync 사용 후
.refine(checkUniqueEmail, {
       message: "해당 이메일에 이미 등록된 계정이 있습니다",
     }),
```

## 비밀번호 해싱

- 보안상 데이터가 유출되어도, 원본 비밀번호를 알수없으니 해킹당하지않음
- 정형데이터로 정해진 양식, 정해진 길이로 맞출 수있음

#### bcrypt 설치

npm i bcrypt
npm i @types/bcrypt

```typescript
export async function createAccount(prevState: any, formData: FormData) {
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
    //...나머지 코드
```

## Iron Session

[1password password generator](https://1password.com/password-generator)

- 비밀번호 생성 사이트

iron-session은 안전하고, statelss한, 쿠키 기반 JavaScript용 세션 라이브러리

```
npm i iron-session
```

### 코드

**/create-account/actions.ts**

```tsx
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
    const cookie = await getIronSession(cookies(), {
      cookieName: "delicious-karrot",
      password: process.env.COOKIE_PASSWORD!,
    });
    //@ts-ignore
    cookie.id = user.id;
    await cookie.save();
    redirect("/profile");
  }
```

cookies()함수는 넥스트js에서 지원하는 함수다.  
env 파일에 비밀번호 생성 사이트에서 생성한 비밀번호를 넣었다.

### 간단 요약

Cookie - Web Browser (Client에서 사용)  
Session - Server에서 사용

단 쿠키안에 세션 ID가 있고  
서버에 세션ID 안에 세션 존재.

1. 브라우저가 서버 접속
2. 서버에서 쿠키안에 세션ID를 브라우저에 전달
3. 브라우저가 쿠키안에 세션ID와 페이지 데이터를 서버에 전달
4. 서버에서 세션ID를 검색하고 페이지에 맞는 데이터 전달.

그러나, 그냥 ID 데이터를 쿠키에 넣으면 보안상 문제가 생길 수 있음.  
따라서 암호화해서 넣고, 빼서 다시 복호화할 것  
이를 위한 도구로 Iron Session이라는 라이브러리를 사용

어떻게 전달 하는지는 구현 방식에 따라 다름.

## 회원가입 프로세스 요약

1. zod를 이용해서 회원가입 폼을 검증  
   a. 검증 실패 시, 오류 메세지를 띄움
2. 검증 성공 시, bcrypt를 이용해서 유저가 입력한 비밀번호 해싱  
   a. 해싱된 비밀번호가 데이터베이스에 저장됨
3. 유저가 입력한 유저명, 이메일, 해싱된 비밀번호를 이용해서 DB에 유저를 생성
4. 유저를 성공적으로 생성했다면 브라우저에 쿠키를 반환  
   a. iron session을 통해 설정한 cookieName에 해당하는 쿠키가 있는 지 확인하고, 없다면 세션 데이터를 암호화하고 쿠키를 설정함  
   (쿠키를 설정할 때는 쿠키에 저장할 데이터를 암호화하여 저장함)
5. 위 단계를 모두 통과했다면 특정 페이지로 리다이렉트 처리
