import { useState } from "react";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { Table } from "@/components/table/table.component";
import { Button } from "@/components/button/button.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { StockApi, type StockAdjustMode } from "@/pages/warehouses/api/warehouses.api";
import { useStock, useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

export function InventoryTab() {
  const { warehouses } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const { stock, loading: stockLoading, refetch: refetchStock } = useStock(selectedWarehouseId || null);

  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQuantity, setAdjustQuantity] = useState("0");
  const [adjustMode, setAdjustMode] = useState<StockAdjustMode>("set");
  const [adjusting, setAdjusting] = useState(false);

  const stockableProducts = products.filter((p) => p.tracksInventory && !p.hasVariants);

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
    <div>
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
              Solo productos sin variantes que controlan inventario. El ajuste de stock por variante se hace
              próximamente desde el detalle de variantes.
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
                <Input type="number" value={adjustQuantity} onChange={(e) => setAdjustQuantity(e.target.value)} />
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
    </div>
  );
}

export default InventoryTab;
