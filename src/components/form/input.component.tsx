import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-outline bg-surface-lowest px-4 py-2.5 text-sm text-on-surface placeholder:text-outline-strong outline-none focus:border-primary ${props.className ?? ""}`}
    />
  );
}

export default Input;
