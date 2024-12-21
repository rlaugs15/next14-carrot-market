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

## Schemas

모델을 생성하고 프리즈마에게 내 DB의 위치를 알려줬고, 데이터 관점에서 모델이 어떻게 생겼는지 알려줘야 한다.

### 1. 모델 생성

**scema.prisma**

```typescript

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  email      String?  @unique
  password   String?
  phone      String?  @unique
  github_id  String?  @unique
  avatar     String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

### npx prisma migrate dev

[공식문서](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/install-prisma-client-typescript-postgresql)

[공식문서: 마이그레이션 생성 및 적용](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production)

- 이 명령은 Prisma 스키마 변경 사항을 기반으로 새 마이그레이션을 생성하고 적용
- 주의! migration dev는 개발 명령이므로 프로덕션 환경에서는 절대 사용해서는 안 된다.

명령어를 입력하면 마이그레이션 이름을 추가하라고 나오는데 유저를 생성했으므로 `add_user`라고 하자.

- db에서 만든 변경사항을 계속해서 추적
- 이름을 입력하면 마이그레이션 파일과 sql 파일을 생성
- 깃허브에 올릴 수 있다.
- 추후 같은 파일을 실제 db를 변환하거나 마이그레이션하는 데 적용할 수 있다.

> **env 파일**
> 나만을 위한 로컬 디비들 추가
> _.db
> _.db-journal
