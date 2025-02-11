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

> #### zod에서 처리해야될 범위
>
> 사용자가 생성한 데이터나 사용자가 제어할 수 없는 다른 API에서 가져온 데이터처럼 신뢰할 수 없거나  
>  제어할 수 없는 데이터를 파싱하고 유효성을 검사할 때 Zod를 사용해야 한다.

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

## zod: superRefine

### 문제상황

회원가입 페이지에서 하나의 유효성 검사만 통과하지 못할 경우에도 모든 영역에서 에러 메시지가 발생

### 해결

superRefine를 이용해 유효성 검사를 문제 위치에서 멈춘다.

- [해결과정: zod의 refine과 superRefine](https://jmjjjmj.tistory.com/223)

#### [.superRefine](https://zod.dev/?id=superrefine)

ctx.addIssue를 통해 원하는 만큼 이슈를 추가할 수 있다.  
함수 실행 중에 ctx.addIssue가 호출되지 않으면 유효성 검사가 통과된다.

- fatal: true 설정 시, 그 다음 refine이 실행되는 것을 방지
- z.NEVER 설정 시, 반환 값 자체를 사용하기 위해서가 아닌, 타입 시스템을 맞추기 위함
- (함수가 특정한 타입 검사를 통과시키면서도, 그 결과 값을 반환할 필요가 없을 때 사용)

**Zod의 오류 처리**  
아래 문서는 Zod의 내부 오류 처리 시스템과 이를 목적에 맞게 사용자 정의할 수 있는 다양한 방법을 설명한다.  
[zod 에러 핸들링](https://zod.dev/ERROR_HANDLING?id=error-handling-in-zod)

> #### [z.NEVER을 사용한 이유](https://zod.dev/?id=abort-early)
>
> fatal: true만 적어도 뒤의 refine은 실행되지 않는다.  
>  반환값은 사용되지는 않지만 타입을 위해서 반환한다.

## 로그아웃

```tsx
async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

export default async function Profile() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div>
      <h1>{user?.username}</h1>
      <form action={logOut}>
        <button>로그아웃</button> //혹은 <input type="submit" value="logout" />
      </form>
    </div>
  );
}
```

코드를 보면 onClick 이벤트를 사용하지 않았다. 클라이언트에서 동작하는 이벤트이기 때문이다.

### [notFound()](https://nextjs-ko.org/docs/app/api-reference/functions/not-found)

notFound() 함수를 호출하면 NEXT_NOT_FOUND 오류가 발생하며, 오류가 발생한 라우트 세그먼트의 렌더링이 중단

## middleware

미들웨어를 사용하면 request가 완료되기 전에 코드를 실행할 수 있다.  
**프로젝트의 모든 라우트에 대해 호출된다.**

```tsx
export async function middleware(request: NextRequest) {
  const session = await getSession();
  console.log("session", session);

  if (request.nextUrl.pathname === "/profile") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

### [미들웨어 사용 케이스](https://nextjs-ko.org/docs/app/building-your-application/routing/middleware#use-cases)

- **1. 인증 및 권한 부여:**  
  특정 페이지나 API 라우트에 대한 액세스 권한을 부여하기 전에 사용자 신원을 확인하고 세션 쿠키를 확인할 때 사용할 수 있다.
- **2. 서버 사이드 리디렉션:**  
  특정 조건(예: local, 사용자 조건)에 따라 서버에서 사용자를 리디렉션한다.
- **3. 경로 Rewriting**:  
  request 속성을 기반으로 API 라우트 또는 페이지에 대한 라우트를 동적으로 재작성하여 A/B 테스트, 기능 출시 또는 레거시 경로를 지원한다.
- **4. 봇 탐지:**  
  봇 트래픽을 탐지하고 차단하여 리소스를 보호한다.
- **5. 로깅 및 분석**
- **6. 기능 플래그 지정**  
  https://nextjs.org/docs/app/building-your-application/routing/middleware#use-cases

## Matcher(미들웨어가 특정 페이지에서만 실행)

matcher를 사용하면 matcher에 지정한 특정 경로들에서만 미들웨어가 실행되도록 할 수 있다.

```tsx
// 배열 구문을 사용하여 단일 경로 또는 다중 경로를 일치시킬 수 있습니다.
export const config = {
  matcher: ["/profile", "/about/:path*", "/dashboard/:path*"],
};

//mathcer는 전체 정규식 표현식을 허용한다. (부정 예측 또는 문자 일치 등)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## Edge Runtime

Next.js에서 **미들웨어(Middleware)**는 **Edge 런타임**에서 실행되며, 이는 **Node.js 전용 API를 지원하지 않는다**는 점을 이해하는 것이 중요하다.  
 따라서, 미들웨어를 작성할 때는 **Edge 런타임과 호환되는 API만 사용**해야 한다.

### Next.js의 두 가지 서버 런타임:

1. **Node.js 런타임 (기본값):**

   - **모든 Node.js API 및 호환 패키지**에 접근할 수 있다.
   - **서버 사이드 렌더링(SSR)**과 같은 기능을 지원한다.

2. **Edge 런타임:**
   - **제한된 API**를 지원하며, **Node.js 전용 API는 지원하지 않는다**.
   - **미들웨어**와 같은 기능에 사용된다.
   - **빠른 응답 시간**과 **낮은 지연 시간**이 요구되는 작업에 적합하다.

**Edge 런타임에서 지원되는 API:**

- **네트워크 API:**

  - `fetch`
  - `Request`
  - `Response`
  - `Headers`

- **인코딩 API:**

  - `TextEncoder`
  - `TextDecoder`

- **스트림 API:**

  - `ReadableStream`
  - `WritableStream`
  - `TransformStream`

- **암호화 API:**

  - `crypto.subtle`

- **웹 표준 API:**
  - `URL`
  - `URLSearchParams`

**Edge 런타임에서 지원되지 않는 Node.js API 예시:**

- `fs` (파일 시스템)
- `path`
- `process`
- `Buffer`

## Authentication Middleware(인증된 사용자만 접근되는 미들웨어)

```typescript
interface Routes {
  [key: string]: boolean;
}
const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (exists) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

- **비회원:** 회원 전용 페이지 접근 시 홈("/")으로 이동.
- **회원:** 로그인 페이지 접근 시 자동으로 "/products"로 이동.
- **일반 회원 페이지**("/products", "/dashboard" 등)는 회원만 접근 가능.

## 요약

#### 1. 미들웨어란?

**요청이 완료되기 전에 코드를 실행할 수 있는 함수**  
 주로 요청과 응답을 가로채서 수정하거나 조작하는 데 사용되며 인증, 로깅, URL rewrite 등의 작업에 유용하다.  
이미지, CSS, JS, Favicon 요청 등 웹 사이트의 모든 단일 request 하나하나마다 미들웨어가 실행된다.

#### 2. 런타임

Next.js 미들웨어는 Node.js 런타임 내에서 실행되지 않고, Edge 런타임에서 실행된다. (Node.js의 경량화 버전)  
**Edge 런타임**에서 지원하는 API는 제한적이며 [해당 문서](https://nextjs.org/docs/app/api-reference/edge)에서 확인할 수 있다.

#### 3. 설정

미들웨어에 config 객체를 통해 미들웨어가 어떤 url에서 실행되어야 하는 지를 세부적으로 설정할 수 있다.  
(배열, 정규표현식 등 사용 가능)
