## Introduction

- 이미지 업로드
- 서버 액션을 이용한 무한 스크롤
- 인터셉트 경로
- zod + 서버 액션 + 리액트 훅 폼

## Tab Bar(Heroicons 라이브러리 적용)

Heroicons을 설치해서 아이콘을 적용할 수 있다.

**설치**

```
npm install @heroicons/react
```

**사용 예시**

```typescript
import { HomeIcon } from "@heroicons/react/24/solid";

export default function Example() {
  return <HomeIcon className="w-6 h-6 text-blue-500" />;
}
```

**경로 설명**

- `@heroicons/react/24/solid` → 굵은 스타일 아이콘
- `@heroicons/react/24/outline` → 외곽선 스타일 아이콘
