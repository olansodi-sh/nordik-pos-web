import { useState } from "react";
import { Warehouse as WarehouseIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { WarehousesTab } from "@/pages/warehouses/components/warehouses-tab.component";
import { InventoryTab } from "@/pages/warehouses/components/inventory-tab.component";
import { StockMovementsTab } from "@/pages/warehouses/components/stock-movements-tab.component";
import { StockCountTab } from "@/pages/warehouses/components/stock-count-tab.component";

type TabKey = "warehouses" | "inventory" | "movements" | "count";

const TABS: { key: TabKey; label: string }[] = [
  { key: "warehouses", label: "Bodegas" },
  { key: "inventory", label: "Inventario" },
  { key: "movements", label: "Movimientos" },
  { key: "count", label: "Conteo físico" },
];

const WarehousesPage = () => {
  const [tab, setTab] = useState<TabKey>("warehouses");

  return (
    <div>
      <PageHeader title="Bodegas" description="Gestión de bodegas e inventario" icon={WarehouseIcon} />

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
        {tab === "warehouses" && <WarehousesTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "movements" && <StockMovementsTab />}
        {tab === "count" && <StockCountTab />}
      </Card>
    </div>
  );
};

export default WarehousesPage;
