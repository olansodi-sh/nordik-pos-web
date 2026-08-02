import { useState } from "react";
import { Contact } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { CustomersTab } from "@/pages/thirdparty/components/customers-tab.component";
import { SuppliersTab } from "@/pages/thirdparty/components/suppliers-tab.component";

type TabKey = "customers" | "suppliers";

const TABS: { key: TabKey; label: string }[] = [
  { key: "customers", label: "Clientes" },
  { key: "suppliers", label: "Proveedores" },
];

const ThirdpartyPage = () => {
  const [tab, setTab] = useState<TabKey>("customers");

  return (
    <div>
      <PageHeader title="Gestión Terceros" description="Clientes y proveedores" icon={Contact} />

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
        {tab === "customers" && <CustomersTab />}
        {tab === "suppliers" && <SuppliersTab />}
      </Card>
    </div>
  );
};

export default ThirdpartyPage;
