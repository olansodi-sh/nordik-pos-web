import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { DRAWER_NAV, isNavGroup, type NavGroup, type NavLeaf } from "@/navigations/drawer.navigation";
import { useAuth } from "@/stores/auth.store";

function leafClasses(isActive: boolean) {
  return `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary text-on-primary"
      : "text-on-surface-variant hover:bg-surface-container"
  }`;
}

function NavLeafLink({ item }: { item: NavLeaf }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} className={({ isActive }) => leafClasses(isActive)}>
      <Icon size={17} strokeWidth={2} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function NavGroupItem({ group, defaultOpen }: { group: NavGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = group.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
      >
        <Icon size={17} strokeWidth={2} className="shrink-0 text-primary" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-outline-strong transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-1 ml-3 space-y-1 border-l border-outline pl-3">
          {group.children.map((child) => (
            <NavLeafLink key={child.key} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { user, canSeeMenu } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  function isVisible(key: string, superAdminOnly?: boolean) {
    if (superAdminOnly && !isSuperAdmin) return false;
    return canSeeMenu(key);
  }

  const visibleNav = DRAWER_NAV.filter((entry) => isVisible(entry.key))
    .map((entry) => {
      if (!isNavGroup(entry)) return entry;
      return {
        ...entry,
        children: entry.children.filter((c) => isVisible(c.key, c.superAdminOnly)),
      };
    })
    .filter((entry) => (isNavGroup(entry) ? entry.children.length > 0 : true));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-outline bg-surface-lowest">
      <div className="flex items-center gap-2.5 border-b border-outline px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">
          NH
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-on-surface">NordikHat</p>
          <p className="text-xs text-secondary">Punto de venta</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {visibleNav.map((entry) => {
          if (isNavGroup(entry)) {
            const isActiveGroup = entry.children.some((c) => location.pathname.startsWith(c.to));
            return <NavGroupItem key={entry.key} group={entry} defaultOpen={isActiveGroup} />;
          }
          return <NavLeafLink key={entry.key} item={entry} />;
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
