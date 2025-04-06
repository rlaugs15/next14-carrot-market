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
export async function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: "http://localhost:3000/github/complete", //Authorization callback URL (인증 콜백 URL)
    scope: "read:user,user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const fullURL = `${baseURL}?${formattedParams}`;

  return redirect(fullURL);
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

## Github API

액세스 토큰을 사용하면 사용자를 대신하여 API에 요청  
유저 아이디나 닉네임 등 필요한 정보들을 가져온다.

```
Authorization: Bearer OAUTH-TOKEN
GET https://api.github.com/user
```

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
  const { error, access_token } = await (
    await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  /* 캐럿마켓의 유저 데이터에 필요한 것들을 가져온다. */
  const { id, login, avatar_url } = await (
    await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    })
  ).json();

  const user = await prisma.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }
  const userNameCheck = await prisma.user.findUnique({
    where: {
      username: login,
    },
    select: {
      username: true,
    },
  });
  const newUser = await prisma.user.create({
    data: {
      github_id: id + "",
      avatar: avatar_url,
      username: userNameCheck ? `login-${login}` : login,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}
```

## SMS Token

토큰을 생성하고, 검증하는 로직을 구현

### [Twilio](https://www.twilio.com/)

SMS, 음성, 영상, 이메일 등 다양한 통신 서비스를 제공하는 클라우드 기반 플랫폼  
특히, SMS 서비스를 통해 개발자가 간편하게 문자 메시지를 전송하고 수신할 수 있도록 API를 제공

`app/(auth)/sms/actions.ts`

#### 전화번호가 유효할 경우 해야할 것

1. 이전 토큰 삭제
2. 새 토큰 생성
3. 생성된 토큰을 twilio의 sms를 통해 유저에게 전송

### crypto

Node.js에서 보안 관련 작업을 처리할 때 사용하는 내장 모듈

- **주요 기능**: 랜덤값 생성, 해시, 암호화 등
- **사용 예**: 비밀번호 해시, 인증 코드 생성, 토큰 생성 등

> **왜 Math.random() 대신 crypto.randomInt()?**  
> Math.random()은 보안적으로 안전하지 않음  
> 인증번호, 토큰, 비밀번호 같은 보안 관련 값 생성 시에는 crypto를 써야 함  
> crypto.randomInt()는 암호학적으로 안전한 난수를 제공
