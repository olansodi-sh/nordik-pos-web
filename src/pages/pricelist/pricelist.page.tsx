import { useState } from "react";
import { Tags } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { PriceListsTab } from "@/pages/pricelist/components/price-lists-tab.component";
import { PromotionsTab } from "@/pages/pricelist/components/promotions-tab.component";

type TabKey = "priceLists" | "promotions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "priceLists", label: "Listas de precios" },
  { key: "promotions", label: "Promociones" },
];

const PricelistPage = () => {
  const [tab, setTab] = useState<TabKey>("priceLists");

  return (
    <div>
      <PageHeader title="Precios y promociones" description="Listas de precios por canal y descuentos" icon={Tags} />

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
        {tab === "priceLists" && <PriceListsTab />}
        {tab === "promotions" && <PromotionsTab />}
      </Card>
    </div>
  );
};

export default PricelistPage;
