import { useState } from "react";
import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { SaleDetailModal } from "@/pages/sales/components/sale-detail-modal.component";
import { useSales } from "@/pages/sales/hooks/sales.hook";
import type { Sale } from "@/pages/sales/api/sales.api";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Sin pago",
  partial: "Pago parcial",
  paid: "Pagada",
  cancelled: "Cancelada",
};

const SalesPage = () => {
  const { sales, loading, refetch } = useSales();
  const { customers } = useCustomers();
  const [selected, setSelected] = useState<Sale | null>(null);

  const columns: TableColumn<Sale>[] = [
    { key: "number", header: "Número", render: (s) => s.number },
    { key: "date", header: "Fecha", render: (s) => new Date(s.date).toLocaleString() },
    {
      key: "customer",
      header: "Cliente",
      render: (s) => (s.customerId ? (customers.find((c) => c.id === s.customerId)?.name ?? "—") : "Consumidor final"),
    },
    { key: "total", header: "Total", render: (s) => s.total },
    { key: "paid", header: "Pagado", render: (s) => s.paidAmount },
    { key: "status", header: "Estado", render: (s) => STATUS_LABELS[s.status] ?? s.status },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <button
          type="button"
          onClick={() => setSelected(s)}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
        >
          Ver detalle
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Ventas" description="Historial de ventas" icon={Receipt} />
      <Card>
        {!loading && sales.length === 0 ? (
          <EmptyState icon={Receipt} title="Sin ventas" description="Las ventas registradas en el POS aparecerán aquí." />
        ) : (
          <Table columns={columns} rows={sales} rowKey={(s) => s.id} loading={loading} />
        )}
      </Card>

      {selected && (
        <SaleDetailModal
          sale={selected}
          onClose={() => setSelected(null)}
          onPaid={() => {
            setSelected(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
};

export default SalesPage;
