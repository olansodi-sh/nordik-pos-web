import { useState } from "react";
import { Field } from "@/components/form/field.component";
import { Select } from "@/components/form/select.component";
import { Input } from "@/components/form/input.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { History } from "lucide-react";
import type { StockMovement, StockMovementType } from "@/pages/warehouses/api/warehouses.api";
import { useStockMovements, useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

const TYPE_LABELS: Record<StockMovementType, string> = {
  initial: "Inicial",
  sale: "Venta",
  sale_void: "Anulación de venta",
  purchase: "Compra",
  credit_note_restock: "Reingreso por nota crédito",
  adjustment_set: "Ajuste manual (fijar)",
  adjustment_add: "Ajuste manual (sumar/restar)",
  count: "Conteo físico",
};

export function StockMovementsTab() {
  const { warehouses } = useWarehouses();
  const { products } = useProducts();

  const [warehouseId, setWarehouseId] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { movements, loading } = useStockMovements(
    {
      warehouseId: warehouseId || undefined,
      type: (type || undefined) as StockMovementType | undefined,
      from: from || undefined,
      to: to || undefined,
    },
    true,
  );

  const columns: TableColumn<StockMovement>[] = [
    { key: "date", header: "Fecha", render: (m) => new Date(m.date).toLocaleString() },
    {
      key: "product",
      header: "Producto",
      render: (m) =>
        m.productId
          ? (products.find((p) => p.id === m.productId)?.name ?? m.productId)
          : `Variante ${m.variantId?.slice(0, 8)}`,
    },
    {
      key: "warehouse",
      header: "Bodega",
      render: (m) => warehouses.find((w) => w.id === m.warehouseId)?.name ?? m.warehouseId,
    },
    { key: "type", header: "Tipo", render: (m) => TYPE_LABELS[m.type] ?? m.type },
    { key: "delta", header: "Cambio", render: (m) => (Number(m.quantityDelta) > 0 ? `+${m.quantityDelta}` : m.quantityDelta) },
    { key: "after", header: "Quedó en", render: (m) => m.quantityAfter },
    { key: "reason", header: "Motivo", render: (m) => m.reason ?? "—" },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Field label="Bodega">
          <Select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            placeholder="Todas"
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
        </Field>
        <Field label="Tipo">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Todos"
            options={Object.entries(TYPE_LABELS).map(([v, label]) => ({ value: v, label }))}
          />
        </Field>
        <Field label="Desde">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      {!loading && movements.length === 0 ? (
        <EmptyState icon={History} title="Sin movimientos" description="Aparecerán aquí ventas, compras, ajustes y conteos." />
      ) : (
        <Table columns={columns} rows={movements} rowKey={(m) => m.id} loading={loading} />
      )}
    </div>
  );
}

export default StockMovementsTab;
