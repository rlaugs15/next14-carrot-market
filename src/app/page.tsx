import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-between min-h-screen p-6">
        <div className="my-auto flex flex-col items-center gap-2 *:font-medium">
          <span className="text-9xl">🥕</span>
          <h1 className="text-4xl ">당근</h1>
          <h2 className="text-2xl">당근 마겟에 어서오세요!</h2>
        </div>
        <div className="flex flex-col items-center gap-3 w-full">
          <Button className="w-full">
            <Link href="/create-account">시작하기</Link>
          </Button>
          <div className="flex gap-2">
            <span>이미 계정이 있나요?</span>
            <Link href="/login" className="hover:underline hover:decoration-orange-500">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
