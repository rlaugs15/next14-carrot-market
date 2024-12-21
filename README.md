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

## 초기 세팅

#### 데이터베이스와의 상호작용을 쉽고 효율적으로 관리하는 도구

- 차세대 Node.js와 TypeScript ORM
- Prisma는 개발자가 데이터베이스 스키마를 정의하고, 데이터베이스에 대한 질의 및 조작을 수행하는 작업을 단순화하는데 사용한다.

#### npm i prisma

[프리즈마 홈페이지](https://www.prisma.io/orm)

#### prisma 초기화

npx prisma init

.env
DATABASE_URL="file:./database.db"

[Prisma (VSCode Extension)](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
