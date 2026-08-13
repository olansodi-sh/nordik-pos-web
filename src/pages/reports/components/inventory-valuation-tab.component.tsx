import { Table, type TableColumn } from "@/components/table/table.component";
import { useInventoryValuation } from "@/pages/reports/hooks/reports.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import type { InventoryValuationRow } from "@/pages/reports/api/reports.api";

export function InventoryValuationTab() {
  const { rows, loading } = useInventoryValuation();
  const { warehouses } = useWarehouses();

  const columns: TableColumn<InventoryValuationRow>[] = [
    { key: "warehouse", header: "Bodega", render: (r) => warehouses.find((w) => w.id === r.warehouseId)?.name ?? r.warehouseId },
    { key: "units", header: "Unidades", render: (r) => r.totalUnits },
    { key: "value", header: "Valor (costo)", render: (r) => r.totalValue },
  ];

  return (
    <div>
      <p className="mb-4 text-xs text-secondary">
        Los productos aún no tienen un campo de costo en el sistema, así que el valor se muestra en 0.
      </p>
      <Table columns={columns} rows={rows} rowKey={(r) => r.warehouseId} loading={loading} emptyMessage="Sin stock valorizable." />
    </div>
  );
}

export default InventoryValuationTab;
