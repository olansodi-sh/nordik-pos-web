import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-primary">
        <Icon size={22} strokeWidth={2} />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-on-surface">{title}</h1>
        {description && <p className="text-sm text-secondary">{description}</p>}
      </div>
    </div>
  );
}

export default PageHeader;
