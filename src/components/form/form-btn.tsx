"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

interface FormBtnProps {
  text: string;
}

export default function FormBtn({ text }: FormBtnProps) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className="w-full">
      {pending ? "로딩 중" : text}
    </Button>
  );
}
