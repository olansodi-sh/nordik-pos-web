import { useState } from "react";
import { Warehouse as WarehouseIcon, Plus, Trash2, Boxes } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { StockApi, WarehousesApi, type StockAdjustMode, type Warehouse } from "@/pages/warehouses/api/warehouses.api";
import { useStock, useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

function WarehousesTable({
  warehouses,
  loading,
  onDelete,
}: {
  warehouses: Warehouse[];
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  const columns: TableColumn<Warehouse>[] = [
    { key: "name", header: "Nombre", render: (w) => w.name },
    { key: "location", header: "Ubicación", render: (w) => w.location ?? "—" },
    { key: "active", header: "Estado", render: (w) => (w.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (w) => (
        <button
          type="button"
          onClick={() => onDelete(w.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return <Table columns={columns} rows={warehouses} rowKey={(w) => w.id} loading={loading} />;
}

const WarehousesPage = () => {
  const { warehouses, loading, refetch } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const { stock, loading: stockLoading, refetch: refetchStock } = useStock(selectedWarehouseId || null);

  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQuantity, setAdjustQuantity] = useState("0");
  const [adjustMode, setAdjustMode] = useState<StockAdjustMode>("set");
  const [adjusting, setAdjusting] = useState(false);

  const stockableProducts = products.filter((p) => p.tracksInventory && !p.hasVariants);

  async function onCreate() {
    setSaving(true);
    try {
      await WarehousesApi.create({ name, location: location || undefined });
      notifySuccess("Bodega creada");
      setOpen(false);
      setName("");
      setLocation("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la bodega");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await WarehousesApi.remove(id);
      notifySuccess("Bodega eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la bodega");
    }
  }

  async function onAdjust() {
    if (!selectedWarehouseId || !adjustProductId) return;
    setAdjusting(true);
    try {
      await StockApi.adjust({
        warehouseId: selectedWarehouseId,
        productId: adjustProductId,
        quantity: Number(adjustQuantity),
        mode: adjustMode,
      });
      notifySuccess("Stock actualizado");
      setAdjustProductId("");
      setAdjustQuantity("0");
      await refetchStock();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo ajustar el stock");
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeader title="Bodegas" description="Gestión de bodegas" icon={WarehouseIcon} />
        <Card>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setOpen(true)}>
              <Plus size={15} />
              Nueva bodega
            </Button>
          </div>
          {!loading && warehouses.length === 0 ? (
            <EmptyState icon={WarehouseIcon} title="Sin bodegas" description="Crea tu primera bodega." />
          ) : (
            <WarehousesTable warehouses={warehouses} loading={loading} onDelete={(id) => void onDelete(id)} />
          )}
        </Card>
      </div>

      <div>
        <PageHeader title="Inventario" description="Existencias por bodega" icon={Boxes} />
        <Card>
          <div className="mb-4 max-w-xs">
            <Field label="Bodega">
              <Select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                placeholder="Selecciona una bodega"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
          </div>

          {selectedWarehouseId && (
            <>
              <Table
                columns={[
                  {
                    key: "product",
                    header: "Producto",
                    render: (s) =>
                      s.productId
                        ? (products.find((p) => p.id === s.productId)?.name ?? s.productId)
                        : `Variante ${s.variantId?.slice(0, 8)}`,
                  },
                  { key: "quantity", header: "Cantidad", render: (s) => s.quantity },
                ]}
                rows={stock}
                rowKey={(s) => s.id}
                loading={stockLoading}
                emptyMessage="Sin existencias registradas en esta bodega."
              />

              <div className="mt-6 rounded-xl border border-outline p-4">
                <h4 className="mb-3 text-sm font-semibold text-on-surface">Ajustar stock</h4>
                <p className="mb-3 text-xs text-secondary">
                  Solo productos sin variantes que controlan inventario. El ajuste de stock por variante
                  se hace próximamente desde el detalle de variantes.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Producto">
                    <Select
                      value={adjustProductId}
                      onChange={(e) => setAdjustProductId(e.target.value)}
                      placeholder="Selecciona un producto"
                      options={stockableProducts.map((p) => ({ value: p.id, label: p.name }))}
                    />
                  </Field>
                  <Field label="Cantidad">
                    <Input
                      type="number"
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                    />
                  </Field>
                  <Field label="Modo">
                    <Select
                      value={adjustMode}
                      onChange={(e) => setAdjustMode(e.target.value as StockAdjustMode)}
                      options={[
                        { value: "set", label: "Fijar cantidad" },
                        { value: "add", label: "Sumar/restar" },
                      ]}
                    />
                  </Field>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => void onAdjust()} loading={adjusting} disabled={!adjustProductId}>
                    Aplicar ajuste
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal
        open={open}
        title="Nueva bodega"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!name}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Ubicación (opcional)">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default WarehousesPage;
