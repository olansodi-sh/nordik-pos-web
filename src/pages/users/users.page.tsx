import { useState } from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { UsersTab } from "@/pages/users/components/users-tab.component";
import { RolesTab } from "@/pages/users/components/roles-tab.component";
import { MenuAccessTab } from "@/pages/users/components/menu-access-tab.component";

type TabKey = "users" | "roles" | "menu-access";

const TABS: { key: TabKey; label: string }[] = [
  { key: "users", label: "Usuarios" },
  { key: "roles", label: "Roles y permisos" },
  { key: "menu-access", label: "Accesos de menú" },
];

const UsersPage = () => {
  const [tab, setTab] = useState<TabKey>("users");

  return (
    <div>
      <PageHeader title="Usuarios" description="Administración de usuarios" icon={Users} />

      <div className="mb-6 flex gap-1 border-b border-outline">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === "users" && <UsersTab />}
        {tab === "roles" && <RolesTab />}
        {tab === "menu-access" && <MenuAccessTab />}
      </Card>
    </div>
  );
};

export default UsersPage;
