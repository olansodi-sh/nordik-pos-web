import { useState } from "react";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { PurchaseOrdersApi, type PurchaseLineInput, type PurchaseOrder, type PurchaseOrderStatus } from "@/pages/purchases/api/purchases.api";
import { usePurchaseOrders } from "@/pages/purchases/hooks/purchases.hook";
import { PurchaseLinesEditor } from "@/pages/purchases/components/purchase-lines-editor.component";
import { useSuppliers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  received: "Recibida",
  cancelled: "Cancelada",
};

export function PurchaseOrdersTab() {
  const { orders, loading, refetch } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { warehouses } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [lines, setLines] = useState<PurchaseLineInput[]>([]);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await PurchaseOrdersApi.create({ supplierId, warehouseId, lines });
      notifySuccess("Orden de compra creada");
      setOpen(false);
      setSupplierId("");
      setWarehouseId("");
      setLines([]);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la orden de compra");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdateStatus(order: PurchaseOrder, status: PurchaseOrderStatus) {
    try {
      await PurchaseOrdersApi.updateStatus(order.id, status);
      notifySuccess("Estado actualizado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar el estado");
    }
  }

  const columns: TableColumn<PurchaseOrder>[] = [
    { key: "number", header: "Número", render: (o) => o.number },
    { key: "supplier", header: "Proveedor", render: (o) => suppliers.find((s) => s.id === o.supplierId)?.name ?? "—" },
    { key: "date", header: "Fecha", render: (o) => new Date(o.date).toLocaleDateString() },
    { key: "total", header: "Total", render: (o) => o.total },
    {
      key: "status",
      header: "Estado",
      render: (o) => (
        <Select
          value={o.status}
          onChange={(e) => void onUpdateStatus(o, e.target.value as PurchaseOrderStatus)}
          options={Object.entries(STATUS_LABELS).map(([v, label]) => ({ value: v, label }))}
          className="w-36"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nueva orden de compra
        </Button>
      </div>

      {!loading && orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin órdenes de compra" description="Crea tu primera orden a un proveedor." />
      ) : (
        <Table columns={columns} rows={orders} rowKey={(o) => o.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva orden de compra"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onCreate()}
              loading={saving}
              disabled={!supplierId || !warehouseId || lines.length === 0}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Proveedor">
              <Select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="Selecciona un proveedor"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Field>
            <Field label="Bodega de recepción">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="Selecciona una bodega"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
          </div>
          <PurchaseLinesEditor products={products} lines={lines} onChange={setLines} />
        </div>
      </Modal>
    </div>
  );
}

export default PurchaseOrdersTab;
