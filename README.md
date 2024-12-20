# Server Actions

#### Server Actions이란?

- "use server"로 선언된 함수이며, Client Component에서도 호출할 수 있다.
- 함수나 파일에 작성해 두면, 함수 내용을 자동으로 서버 API로 만들어주고, 개발자는 유저에게 코드가 노출될 걱정 없이 자유롭게 데이터베이스를 관리할 수 있다.

> 리액트 쿼리의 인자로 들어가는 axios나 fetch 요청 함수를 작성할 때 유용할 것 같다.

## Route Handlers

**웹 요청 및 응답 API를 사용하여 특정 경로에 대한 사용자 커스텀 요청 핸들러를 생성할 수 있다.**

[공식문서 참고](https://nextjs-ko.org/docs/app/building-your-application/routing/route-handlers)

- app 디렉토리 내에서만 사용
- app 디렉토리 내의 route.js|ts 파일로 정의
- pages 디렉토리 내의 API Routes와 동일한 기능을 하므로, API Routes와 Route Handlers를 함께 사용할 필요가 ${\textsf{\color{#4174D9}없다.}}$
- 기본적으로 캐시되지 않지만, GET 메서드에 대해 캐시를 선택할 수 있다.

### 언제 사용하나?

- IOS나 안드로이드 앱을 만들 경우
- Webhook 같은 걸 위한 API를 만들어야 하는 경우 등

### 예시

로그인 데이터를 post 요청

/app/login/page.tsx

```tsx
"use client";

export default function LogIn() {
  const onClick = async () => {
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "nico",
        password: "1234",
      }),
    });
    console.log(await response.json()); // {username: "nico", password: "1234"}
  };

  return (
    <form>
      <input />
      <input type="password" />
      <button onClick={onClick}>로그인</button>
    </form>
  );
}
```

/app/api/users/route.ts

```tsx
import { NextRequest } from "next/server";
//get 요청
export async function GET(request: NextRequest) {
  console.log(request);
  return Response.json({
    ok: true,
  });
}

//post 요청
export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("log the user in!!!");
  return Response.json(data);
}
```

## Server actions

**Server Actions은 서버에서 실행되는 비동기 함수**  
 Next.js 애플리케이션에서 form 제출 및 데이터 변형을 처리하기 위해 서버 및 클라이언트 컴포넌트에서 호출할 수 있다.

백엔드에 요청을 보내는 궁극적인 행위는 똑같은데, ${\textsf{\color{#4174D9}서버액션을 쓰면 이전처럼 손수 라우터 핸들러를 만들어 주지 않아도 된다.}}$

- 네트워크탭을 보면 post 요청이 보내진 것을 확인할 수 있다.

```tsx
export default function LogIn() {
  async function handleForm(formData: FormData) {
    "use server"; //해당 함수가 서버에서만 실행되게 한다. 항상 함수의 최상단에 위치
    console.log(formData.get("email"), formData.get("password"));
    console.log("i run in the server baby!");
  }
  return (
      </div>
      <form action={handleForm} className="flex flex-col gap-3">
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          errors={[]}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          errors={[]}
        />
        <FormButton loading={false} text="Log in" />
      </form>
      <SocialLogin />
    </div>
  );
}
```

## useFormState

서버 액션을 ui로 보내는 방법

#### useFormState란?

폼 제출 시 비동기 작업을 수행하고, 상태를 관리하며, 로딩 상태를 체크할 수 있는 ${\textsf{\color{#4174D9}리액트 훅}}$

- 사용법은 useState와 비슷하다.

클라이언트 컴포넌트에서도 서버액션을 호출할 수 있지만, 로직이 해당 컴포넌트에 있을 순 없다.  
그러므로 actions.ts로 분리했다.

**/app/login/actions/ts**

```tsx
"use server";
export async function handleForm(prevState: any, formData: FormData) {
  console.log(prevState);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    errors: ["wrong password", "password too short"],
  };
}
```

**/app/login/page.tsx**

```tsx
"use client";
import { handleForm } from "./actions";
import { useFormState } from "react-dom";

export default function Login() {
  const [state, formAction] = useFormState(handleForm, {
    error: 1, //원래는 handleForm의 리턴값과 같아야 한다.
  } as any);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <section>
        <form action={formAction} className="flex flex-col gap-3">
          <FormInput
            name="email"
            type="email"
            placeholder="Email"
            required
            errors={state.errors ?? []}
          />
          <FormInput
            name="password"
            type="password"
            placeholder="Password"
            required
            errors={state.errors ?? []}
          />
          <FormBtn text="로그인" />
        </form>
      </section>
      <Separator className="my-4" />
      <section className="space-y-4">
        <Button className="w-full">
          <span>깃허브 로그인</span>
        </Button>
        <Button className="w-full">
          <span>SMS 로그인</span>
        </Button>
      </section>
    </div>
  );
}
```
