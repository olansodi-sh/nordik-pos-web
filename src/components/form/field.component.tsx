import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}

export default Field;
