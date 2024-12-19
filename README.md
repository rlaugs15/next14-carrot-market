## Route Handlers

** 웹 요청 및 응답 API를 사용하여 특정 경로에 대한 사용자 커스텀 요청 핸들러를 생성할 수 있다.**  
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
    const response = await fetch("/www/users", {
      method: "POST",
      body: JSON.stringify({
        username: "nico",
        password: "1234",
      }),
    });
    console.log(await response.json()); //
  };
  const onClick = async () => {
    const response = await fetch("/www/users", {
      method: "POST",
      body: JSON.stringify({
        username: "jun",
      }),
    });
    console.log(await response.json()); //{username: 'jun'}
  };
  return (
    <form>
      <input />
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
