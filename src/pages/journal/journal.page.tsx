import { useState } from "react";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useCashSessionsHistory } from "@/pages/journal/hooks/journal.hook";
import { SessionMovementsModal } from "@/pages/journal/components/session-movements-modal.component";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useAppUsers } from "@/pages/users/hooks/users.hook";
import type { CashSession } from "@/pages/pointofsale/api/pointofsale.api";

const STATUS_LABELS: Record<string, string> = {
  open: "Abierta",
  closed: "Cerrada",
};

const JournalPage = () => {
  const { sessions, loading } = useCashSessionsHistory();
  const { warehouses } = useWarehouses();
  const { users } = useAppUsers();
  const [selected, setSelected] = useState<CashSession | null>(null);

  const columns: TableColumn<CashSession>[] = [
    { key: "user", header: "Usuario", render: (s) => users.find((u) => u.id === s.userId)?.name ?? "—" },
    { key: "warehouse", header: "Bodega", render: (s) => warehouses.find((w) => w.id === s.warehouseId)?.name ?? "—" },
    { key: "openedAt", header: "Apertura", render: (s) => new Date(s.openedAt).toLocaleString() },
    { key: "opening", header: "Monto apertura", render: (s) => s.openingAmount },
    { key: "closedAt", header: "Cierre", render: (s) => (s.closedAt ? new Date(s.closedAt).toLocaleString() : "—") },
    { key: "expected", header: "Esperado", render: (s) => s.expectedAmount ?? "—" },
    { key: "counted", header: "Contado", render: (s) => s.countedAmount ?? "—" },
    { key: "difference", header: "Diferencia", render: (s) => s.difference ?? "—" },
    { key: "status", header: "Estado", render: (s) => STATUS_LABELS[s.status] },
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
          Ver movimientos
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Libro diario" description="Historial de caja y sus movimientos" icon={BookOpen} />
      <Card>
        <p className="mb-4 text-xs text-secondary">
          El sistema no maneja contabilidad de partida doble — este libro muestra el historial de aperturas/cierres
          de caja y sus movimientos de efectivo (ventas, ingresos y egresos manuales).
        </p>
        {!loading && sessions.length === 0 ? (
          <EmptyState icon={BookOpen} title="Sin sesiones de caja" description="Aparecerán aquí cuando se abra una caja en el punto de venta." />
        ) : (
          <Table columns={columns} rows={sessions} rowKey={(s) => s.id} loading={loading} />
        )}
      </Card>

      {selected && <SessionMovementsModal session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default JournalPage;
