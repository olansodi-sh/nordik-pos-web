import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Icon size={28} className="text-outline-strong" />
      <p className="text-sm font-medium text-on-surface">{title}</p>
      {description && <p className="text-sm text-secondary">{description}</p>}
    </div>
  );
}

export default EmptyState;
