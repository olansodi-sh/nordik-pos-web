import { useState } from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { BusinessDataTab } from "@/pages/business/components/business-data-tab.component";
import { CustomFieldsTab } from "@/pages/business/components/custom-fields-tab.component";

type TabKey = "data" | "custom-fields";

const TABS: { key: TabKey; label: string }[] = [
  { key: "data", label: "Datos" },
  { key: "custom-fields", label: "Campos personalizados" },
];

const BusinessPage = () => {
  const [tab, setTab] = useState<TabKey>("data");

  return (
    <div>
      <PageHeader
        title="Datos del negocio"
        description="Información general de tu empresa en NordikHat POS"
        icon={Building2}
      />

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
        {tab === "data" && <BusinessDataTab />}
        {tab === "custom-fields" && <CustomFieldsTab />}
      </Card>
    </div>
  );
};

export default BusinessPage;
