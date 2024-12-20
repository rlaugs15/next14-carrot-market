import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  errors?: string[];
}

export default function FormInput({
  errors = [],
  name,
  ...rest
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        {...rest}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400"
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
}
