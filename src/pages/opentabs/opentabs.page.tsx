import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useSales } from "@/pages/sales/hooks/sales.hook";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { SaleDetailModal } from "@/pages/sales/components/sale-detail-modal.component";
import { AddLinesModal } from "@/pages/opentabs/components/add-lines-modal.component";
import type { Sale } from "@/pages/sales/api/sales.api";

const OpenTabsPage = () => {
  const { sales, loading, refetch } = useSales();
  const { customers } = useCustomers();
  const [detail, setDetail] = useState<Sale | null>(null);
  const [addingTo, setAddingTo] = useState<Sale | null>(null);

  const openTabs = sales.filter((s) => s.status === "confirmed" || s.status === "partial");

  const columns: TableColumn<Sale>[] = [
    { key: "label", header: "Cuenta", render: (s) => s.label ?? s.number },
    { key: "date", header: "Fecha", render: (s) => new Date(s.date).toLocaleString() },
    {
      key: "customer",
      header: "Cliente",
      render: (s) => (s.customerId ? (customers.find((c) => c.id === s.customerId)?.name ?? "—") : "Consumidor final"),
    },
    { key: "total", header: "Total", render: (s) => s.total },
    { key: "pending", header: "Saldo pendiente", render: (s) => (Number(s.total) - Number(s.paidAmount)).toFixed(2) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setAddingTo(s)}
            className="rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            Agregar productos
          </button>
          <button
            type="button"
            onClick={() => setDetail(s)}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
          >
            Cobrar / detalle
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cuentas abiertas"
        description="Ventas pendientes de cobro: mesas, fiado o cuentas en curso"
        icon={ClipboardList}
      />
      <Card>
        {!loading && openTabs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin cuentas abiertas"
            description='Se crean desde el Punto de Venta con el botón "Dejar pendiente (cuenta abierta)".'
          />
        ) : (
          <Table columns={columns} rows={openTabs} rowKey={(s) => s.id} loading={loading} />
        )}
      </Card>

      {detail && (
        <SaleDetailModal
          sale={detail}
          onClose={() => setDetail(null)}
          onPaid={() => {
            setDetail(null);
            void refetch();
          }}
        />
      )}

      {addingTo && (
        <AddLinesModal
          sale={addingTo}
          onClose={() => setAddingTo(null)}
          onAdded={() => {
            setAddingTo(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
};

export default OpenTabsPage;
