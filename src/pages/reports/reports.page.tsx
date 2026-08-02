import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { SalesSummaryTab } from "@/pages/reports/components/sales-summary-tab.component";
import { TopCustomersTab } from "@/pages/reports/components/top-customers-tab.component";
import { InventoryValuationTab } from "@/pages/reports/components/inventory-valuation-tab.component";
import { LoyaltyTab } from "@/pages/reports/components/loyalty-tab.component";

type TabKey = "sales" | "customers" | "inventory" | "loyalty";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sales", label: "Resumen de ventas" },
  { key: "customers", label: "Top clientes" },
  { key: "inventory", label: "Valorización de inventario" },
  { key: "loyalty", label: "Fidelización" },
];

const ReportsPage = () => {
  const [tab, setTab] = useState<TabKey>("sales");

  return (
    <div>
      <PageHeader title="Reportes" description="Reportes financieros" icon={BarChart3} />

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
        {tab === "sales" && <SalesSummaryTab />}
        {tab === "customers" && <TopCustomersTab />}
        {tab === "inventory" && <InventoryValuationTab />}
        {tab === "loyalty" && <LoyaltyTab />}
      </Card>
    </div>
  );
};

export default ReportsPage;
