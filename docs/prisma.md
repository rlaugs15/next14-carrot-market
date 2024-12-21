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

- 추후 실제 db로 변경할 것

[Prisma (VSCode Extension)](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

### [플러그인 prisma 다운](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

cmd + shift + p로 JSON settings 파일을 열고

```json
"[prisma]": {
"editor.defaultFormatter": "Prisma.prisma"
}
```

추가하면 **save시** 릴레이션 자동완성

## Schemas 및 프리즈마 스튜디오

- [모델 공식문서](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-models)
- [모델 쿼리 공식문서](https://www.prisma.io/docs/orm/reference/prisma-client-reference#findunique)
  - [자주 사용한 모델 쿼리 정리](https://velog.io/@rlaugs15/%ED%94%84%EB%A6%AC%EC%A6%88%EB%A7%88-%EB%AA%A8%EB%8D%B8-%EC%BF%BC%EB%A6%AC)

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

## Prisma Client 및 테스트(데이터베이스 쿼리 단계)

[해당 단계 공식문서](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/querying-the-database-typescript-postgresql)

### 테스트

**/lib/db.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.create({
    data: {
      username: "test",
    },
  });
}
test();
export default prisma;
```

**아무 page.tsx**

```typescript
import @lip/db
```

해당 페이지에서 새로고침을 한다.
테스트가 성공한다면 터미널에 `username: "test"`을 가진 유저 모델이 뜬다.

## Prisma Studio

[Prisma Studio 공식문서](https://www.prisma.io/docs/orm/tools/prisma-studio)

**데이터베이스의 데이터 시각화를 위한 편집기**
Prisma 스키마 파일에 정의된 모든 모델 목록을 확인하고 데이터베이스를 관리할 수 있다.

npx prisma studio

### 모델을 변경하고 프리즈마 스튜디오에 반영할 경우

- 터미널에서 프리즈마 스튜디오를 끄고 재시작

> **주의점**
> 터미널에서 넥스트js 서버를 끄지 않게 주의하자.
> 분리된 탭에서 열어야 한다.
