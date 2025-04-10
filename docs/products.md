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

## Product Component(이미지 레이아웃 시프트 현상(Image 컴포넌트))

### Next에서 제공하는 [Image 컴포넌트](https://nextjs-ko.org/docs/app/api-reference/components/image)

기본 jsx img가 지원하지않는 여러가지 강력한기능을 지원함

- 로딩 전후로 컴포넌트 위치가 밀리는 content shift 를 방지
- 압축률이나, 화면 크기별 압축옵션을 제공
- 필수 prop으로 src, width, height, alt를 입력
- width, height를 모른다면, fill을 제공해주면 됨
- fill은 이미지를 자동으로 부모컴포넌트의 크기로 맞춰 줌
