import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { PurchaseOrdersTab } from "@/pages/purchases/components/purchase-orders-tab.component";
import { PurchaseInvoicesTab } from "@/pages/purchases/components/purchase-invoices-tab.component";
import { DebitNotesTab } from "@/pages/purchases/components/debit-notes-tab.component";

type TabKey = "orders" | "invoices" | "debitNotes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "orders", label: "Órdenes de compra" },
  { key: "invoices", label: "Facturas de compra" },
  { key: "debitNotes", label: "Notas débito" },
];

const PurchasesPage = () => {
  const [tab, setTab] = useState<TabKey>("orders");

  return (
    <div>
      <PageHeader title="Compras" description="Compras a proveedores" icon={ShoppingBag} />

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
        {tab === "orders" && <PurchaseOrdersTab />}
        {tab === "invoices" && <PurchaseInvoicesTab />}
        {tab === "debitNotes" && <DebitNotesTab />}
      </Card>
    </div>
  );
};

export default PurchasesPage;
