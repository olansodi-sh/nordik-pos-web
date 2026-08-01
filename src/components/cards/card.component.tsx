import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-outline bg-surface-lowest p-6 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
