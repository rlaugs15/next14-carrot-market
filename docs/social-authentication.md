## Github Authentication

깃헙에서

1. 사용자 프로필 클릭
2. 사이드메뉴 맨 아래
3. '<> Developer settings' 메뉴 클릭
4. OAuth Apps 메뉴 클릭
5. 중앙 컨텐츠 우측 상단 'New OAuth App' 클릭

그리고 Client secrets 탭에서 시크릿 키를 생성한 후, 클라이언트ID와 시크릿 키를 `.env` 파일에 적는다.  
그 후에 [OAuth 앱 권한 부여](https://docs.github.com/ko/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)를 읽으며 단계를 따라가면 된다.

> 만약 미들웨어에 퍼블릭 url 등 관한 설정을 해놨다면 한 번 확인해보자.

이제 Route Handlers 설정을 해야한다.

### [Route Handlers](https://velog.io/@rlaugs15/Route-Handler)

Route Handlers를 사용하면 웹 요청 및 응답 API를 사용하여 특정 경로에 대한 커스텀 요청 핸들러를 생성할 수 있다.

`app/api/github/start/route.ts`

```typescript
export async function GET(request: Request) {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: "http://localhost:3000/github/complete", //Authorization callback URL (인증 콜백 URL)
    scope: "read:user,user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const fullURL = `${baseURL}?${formattedParams}`;

  return Response.redirect(fullURL);
}
```

**OAuth 앱 권한 부여**의 **1. 사용자의 GitHub ID 요청**을 보면 `scope` 라는 매개변수가 있다.  
깃허브에게 우리가 사용자로부터 원하는 데이터가 무엇인지 알리는 것이다.(리포, 유저 등등)  
유저 데이터면 충분하다.

## Access Token

`app/api/github/complete/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return notFound();
  }
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  });
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenRes = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("error" in accessTokenRes) {
    return new Response(null, {
      status: 400,
    });
  }
  return Response.json({ accessTokenRes });
}
```

코드를 보면 if문 안에 있는 부분은 new Response고 바깥은 new가 붙지 않았다.  
왜 그런 걸까?  
**응답 목적이 다르기 때문**

#### new Response(...)는 인스턴스 생성자

```typescript
new Response(body, options);
```

- 이건 우리가 직접 Response 객체를 하나 새로 만드는 것
- body, status, headers 등을 **직접 지정해서 응답을 구성**
- 말 그대로 Response라는 클래스의 **인스턴스를 수동으로 생성**

#### Response.json()은 정적(static) 메서드

```typescript
Response.json(data);
```

- 이건 Response 클래스가 자체적으로 제공하는 **도우미 함수(헬퍼)**
- 내부적으로는 `JSON.stringify` 하고, `"Content-Type": "application/json"`도 자동으로 붙여줌
- `new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })`를 짧게 쓴 버전이라 보면 된다.
