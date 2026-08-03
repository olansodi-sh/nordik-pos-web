import { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { Field } from "@/components/form/field.component";
import { Select } from "@/components/form/select.component";
import { Input } from "@/components/form/input.component";
import { Button } from "@/components/button/button.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { StockApi } from "@/pages/warehouses/api/warehouses.api";
import { useStock, useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useProducts } from "@/pages/products/hooks/products.hook";

export function StockCountTab() {
  const { warehouses } = useWarehouses();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [warehouseId, setWarehouseId] = useState("");
  const { stock, loading, refetch } = useStock(warehouseId || null);
  const [counted, setCounted] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState<string | null>(null);
  const [reason, setReason] = useState("Conteo físico");

  const stockableProducts = useMemo(
    () => products.filter((p) => p.tracksInventory && !p.hasVariants),
    [products],
  );

  const rows = stockableProducts.map((p) => {
    const existing = stock.find((s) => s.productId === p.id);
    return { product: p, systemQuantity: existing ? Number(existing.quantity) : 0 };
  });

  async function onApply(productId: string, systemQuantity: number) {
    const value = counted[productId];
    if (value === undefined || value === "") return;
    setApplying(productId);
    try {
      await StockApi.applyCount({
        warehouseId,
        productId,
        countedQuantity: Number(value),
        reason: reason || undefined,
      });
      const diff = Number(value) - systemQuantity;
      notifySuccess(
        diff === 0 ? "Conteo aplicado, sin diferencia" : `Conteo aplicado. Diferencia: ${diff > 0 ? "+" : ""}${diff}`,
      );
      setCounted((prev) => ({ ...prev, [productId]: "" }));
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo aplicar el conteo");
    } finally {
      setApplying(null);
    }
  }

  return (
    <div>
      <p className="mb-4 text-xs text-secondary">
        Compara el stock que tiene el sistema contra lo que cuentas físicamente en la bodega. Al aplicar, el
        sistema queda fijado a la cantidad contada y registra la diferencia en la bitácora (pestaña
        "Movimientos") — así detectas faltantes o sobrantes.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 max-w-lg">
        <Field label="Bodega">
          <Select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            placeholder="Selecciona una bodega"
            options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
          />
        </Field>
        <Field label="Motivo (opcional)">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </div>

      {!warehouseId ? (
        <EmptyState icon={ClipboardCheck} title="Elige una bodega" description="Selecciona la bodega que vas a contar." />
      ) : loading ? (
        <p className="text-sm text-secondary">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-outline">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Producto
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Sistema
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Contado
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Diferencia
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {rows.map(({ product, systemQuantity }) => {
                const value = counted[product.id] ?? "";
                const diff = value !== "" ? Number(value) - systemQuantity : null;
                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3 text-on-surface">{product.name}</td>
                    <td className="px-4 py-3 text-on-surface">{systemQuantity}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => setCounted((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {diff === null ? (
                        "—"
                      ) : (
                        <span className={diff === 0 ? "text-secondary" : diff > 0 ? "text-primary" : "text-danger"}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        onClick={() => void onApply(product.id, systemQuantity)}
                        loading={applying === product.id}
                        disabled={value === ""}
                      >
                        Aplicar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StockCountTab;
