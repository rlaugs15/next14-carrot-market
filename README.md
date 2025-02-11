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

### 목차

- [DB 유효성 검사(프리즈마 쿼리의 유효성 검사를 zod로)](/docs/authentication.md/#db-유효성-검사프리즈마-쿼리의-유효성-검사를-zod로)
- [비밀번호 해싱](/docs/authentication.md/#비밀번호-해싱)
- [Iron Session](/docs/authentication.md/#iron-session)
- [회원가입 프로세스 요약](/docs/authentication.md/#회원가입-프로세스-요약)
- [zod: superRefine](/docs//authentication.md/#zod-superrefine)
- [로그아웃](/docs/authentication.md/#로그아웃)
- [미들웨어](/docs/authentication.md/#middleware)
- [Matcher(미들웨어가 특정 페이지에서만 실행)](/docs/authentication.md/#matcher미들웨어가-특정-페이지에서만-실행)
- [Edge Runtime](/docs/authentication.md/#edge-runtime)
- [Authentication Middleware(인증된 사용자만 접근되는 미들웨어)](/docs/authentication.md/#authentication-middleware인증된-사용자만-접근되는-미들웨어)
- [요약](/docs/authentication.md/#요약)
