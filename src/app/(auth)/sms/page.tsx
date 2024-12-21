"use client";
import FormBtn from "@/components/form/form-btn";
import FormInput from "@/components/form/form-input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { useFormState } from "react-dom";
import { handleForm } from "./actions";

const initialState = {
  token: false,
  error: undefined,
};

export default function SMSLogin() {
  const [state, formAction] = useFormState(handleForm, initialState);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <section className="flex flex-col gap-2">
        <CardTitle>SMS 로그인</CardTitle>
        <CardDescription>전화번호를 입력해주세요.</CardDescription>
      </section>
      <section>
        <form action={formAction} className="flex flex-col gap-3">
          {state.token ? (
            <FormInput
              name="token"
              type="number"
              placeholder="인증코드"
              required
              min={100000}
              max={999999}
            />
          ) : (
            <FormInput
              name="phone"
              type="text"
              placeholder="핸드폰 번호"
              required
              errors={state.error?.formErrors}
            />
          )}
          <FormBtn text={state.token ? "토큰 확인" : "인증 SMS 전송"} />
        </form>
      </section>
    </div>
  );
}
