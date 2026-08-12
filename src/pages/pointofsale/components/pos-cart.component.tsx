import { useMemo, useState } from "react";
import { Search, Trash2, ShoppingCart, Barcode as BarcodeIcon } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Card } from "@/components/cards/card.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { ProductsApi, ProductVariantsApi, type Product, type ProductVariant } from "@/pages/products/api/products.api";
import { useProducts } from "@/pages/products/hooks/products.hook";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";
import { usePriceListItems, usePriceLists } from "@/pages/pricelist/hooks/pricelist.hook";
import { SalesApi, PaymentsApi, type PaymentMethod, type Sale } from "@/pages/sales/api/sales.api";
import type { CashSession } from "@/pages/pointofsale/api/pointofsale.api";
import { useCustomFields } from "@/pages/business/hooks/business.hook";

interface CartLine {
  key: string;
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  voucher: "Vale",
  credit: "Crédito",
  online_gateway: "Pasarela en línea",
};

interface PosCartProps {
  session: CashSession;
}

export function PosCart({ session }: PosCartProps) {
  const { products } = useProducts();
  const { warehouses } = useWarehouses();
  const { customers } = useCustomers();
  const { priceLists } = usePriceLists();
  const { fields: customFieldDefs } = useCustomFields("sale");
  const { notifyError, notifySuccess } = useToast();

  const [warehouseId, setWarehouseId] = useState(session.warehouseId ?? "");
  const [customerId, setCustomerId] = useState("");
  const [priceListId, setPriceListId] = useState("");
  const [label, setLabel] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const { items: priceItems } = usePriceListItems(priceListId || null);

  const [search, setSearch] = useState("");
  const [barcodeSearching, setBarcodeSearching] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [variantPicker, setVariantPicker] = useState<{ product: Product; variants: ProductVariant[] } | null>(null);

  const [createdSale, setCreatedSale] = useState<Sale | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [payAmount, setPayAmount] = useState("0");
  const [paying, setPaying] = useState(false);
  const [paidSale, setPaidSale] = useState<Sale | null>(null);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return products.filter((p) => p.active && (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))).slice(0, 8);
  }, [search, products]);

  function estimatedPrice(line: CartLine): number | null {
    const item = priceItems.find((i) => (line.variantId ? i.variantId === line.variantId : i.productId === line.productId));
    return item ? item.price : null;
  }

  const estimatedSubtotal = lines.reduce((sum, l) => sum + (estimatedPrice(l) ?? 0) * l.quantity, 0);

  function addLine(params: { productId?: string; variantId?: string; name: string }) {
    setLines((prev) => {
      const key = params.variantId ?? params.productId ?? params.name;
      const existing = prev.find((l) => (l.variantId ?? l.productId) === key);
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { key, productId: params.productId, variantId: params.variantId, name: params.name, quantity: 1 }];
    });
    setSearch("");
  }

  async function onSelectProduct(p: Product) {
    if (p.hasVariants) {
      const variants = await ProductVariantsApi.list(p.id);
      setVariantPicker({ product: p, variants });
      return;
    }
    addLine({ productId: p.id, name: p.name });
  }

  async function onBarcodeSearch() {
    if (!search.trim()) return;
    setBarcodeSearching(true);
    try {
      const found = await ProductsApi.lookupBarcode(search.trim());
      if (found.variant && found.product) {
        addLine({ variantId: found.variant.id, name: found.product.name });
      } else if (found.product) {
        addLine({ productId: found.product.id, name: found.product.name });
      }
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "Código no encontrado");
    } finally {
      setBarcodeSearching(false);
    }
  }

  function updateQuantity(key: string, quantity: number) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  const missingRequiredCustomField = customFieldDefs.some(
    (f) => f.required && !customFieldValues[f.key],
  );

  async function onConfirmSale() {
    if (!warehouseId || lines.length === 0) return;
    setConfirming(true);
    try {
      const sale = await SalesApi.create({
        channel: "pos",
        customerId: customerId || undefined,
        priceListId: priceListId || undefined,
        warehouseId,
        cashSessionId: session.id,
        label: label || undefined,
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
        lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
      });
      setCreatedSale(sale);
      setPayAmount(String(sale.total));
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar la venta");
    } finally {
      setConfirming(false);
    }
  }

  async function onPay() {
    if (!createdSale) return;
    setPaying(true);
    try {
      await PaymentsApi.create({
        customerId: customerId || undefined,
        method: payMethod,
        amount: Number(payAmount),
        cashSessionId: payMethod === "cash" ? session.id : undefined,
        allocations: [{ saleId: createdSale.id, amount: Math.min(Number(payAmount), Number(createdSale.total)) }],
      });
      notifySuccess("Pago registrado");
      setPaidSale(createdSale);
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo registrar el pago");
    } finally {
      setPaying(false);
    }
  }

  function onNewSale() {
    setLines([]);
    setCreatedSale(null);
    setPaidSale(null);
    setCustomerId("");
    setLabel("");
    setPayAmount("0");
    setCustomFieldValues({});
  }

  function onLeaveAsOpenTab() {
    if (!createdSale) return;
    notifySuccess(
      `Venta ${createdSale.number} quedó pendiente de cobro — la encuentras en "Cuentas abiertas".`,
    );
    onNewSale();
  }

  if (paidSale) {
    const change = Number(payAmount) - Number(paidSale.total);
    return (
      <Card>
        <EmptyState
          icon={ShoppingCart}
          title={`Venta ${paidSale.number} registrada`}
          description={`Total: ${paidSale.total} — ${change > 0 ? `Cambio: ${change.toFixed(2)}` : "Sin cambio"}`}
        />
        <div className="flex justify-center">
          <Button onClick={onNewSale}>Nueva venta</Button>
        </div>
      </Card>
    );
  }

  if (createdSale) {
    return (
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-on-surface">Cobrar venta {createdSale.number}</h3>
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
          <span>Subtotal</span>
          <span className="text-right">{createdSale.subtotal}</span>
          <span>Descuento</span>
          <span className="text-right">{createdSale.discount}</span>
          <span className="font-semibold text-on-surface">Total</span>
          <span className="text-right font-semibold text-on-surface">{createdSale.total}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Método de pago">
            <Select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
              options={Object.entries(PAYMENT_METHOD_LABELS).map(([v, label]) => ({ value: v, label }))}
            />
          </Field>
          <Field label="Monto recibido">
            <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onLeaveAsOpenTab}>
            Dejar pendiente (cuenta abierta)
          </Button>
          <Button onClick={() => void onPay()} loading={paying}>
            Registrar pago
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <div className="mb-4 grid grid-cols-4 gap-4">
            <Field label="Bodega">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                placeholder="Selecciona una bodega"
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Field>
            <Field label="Cliente (opcional)">
              <Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Consumidor final"
                options={customers.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field label="Lista de precios (opcional)">
              <Select
                value={priceListId}
                onChange={(e) => setPriceListId(e.target.value)}
                placeholder="Por defecto del negocio"
                options={priceLists.map((l) => ({ value: l.id, label: l.name }))}
              />
            </Field>
            <Field label="Nombre de cuenta (opcional)">
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Mesa 3, Fiado Juan..." />
            </Field>
          </div>

          {customFieldDefs.length > 0 && (
            <div className="mb-4 grid grid-cols-4 gap-4">
              {customFieldDefs.map((f) => {
                const value = customFieldValues[f.key];
                const label = `${f.label}${f.required ? " *" : ""}`;
                if (f.type === "boolean") {
                  return (
                    <label key={f.id} className="flex items-center gap-2 self-end pb-2.5 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({ ...prev, [f.key]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-outline"
                      />
                      {label}
                    </label>
                  );
                }
                if (f.type === "select") {
                  return (
                    <Field key={f.id} label={label}>
                      <Select
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                        placeholder="Elegir…"
                        options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                      />
                    </Field>
                  );
                }
                return (
                  <Field key={f.id} label={label}>
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={(value as string) ?? ""}
                      onChange={(e) =>
                        setCustomFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                    />
                  </Field>
                );
              })}
            </div>
          )}

          <div className="relative mb-4">
            <Field label="Buscar producto (nombre/SKU) o escanear código de barras">
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onBarcodeSearch();
                  }}
                  placeholder="Escribe o escanea..."
                />
                <Button variant="secondary" onClick={() => void onBarcodeSearch()} loading={barcodeSearching}>
                  <BarcodeIcon size={15} />
                </Button>
              </div>
            </Field>
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-outline bg-surface-lowest shadow-lg">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => void onSelectProduct(p)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-surface-container"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-secondary">{p.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {lines.length === 0 ? (
            <EmptyState icon={Search} title="Carrito vacío" description="Busca un producto o escanea un código para empezar." />
          ) : (
            <div className="flex flex-col gap-2">
              {lines.map((l) => (
                <div key={l.key} className="flex items-center justify-between rounded-md border border-outline px-3 py-2">
                  <div>
                    <p className="text-sm text-on-surface">{l.name}</p>
                    <p className="text-xs text-secondary">
                      {estimatedPrice(l) !== null ? `${estimatedPrice(l)} c/u (estimado)` : "Precio a definir"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={l.quantity}
                      onChange={(e) => updateQuantity(l.key, Number(e.target.value))}
                      className="w-20"
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(l.key)}
                      className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-on-surface">Resumen</h3>
          <div className="mb-4 flex justify-between text-sm text-on-surface-variant">
            <span>Subtotal estimado</span>
            <span>{estimatedSubtotal.toFixed(2)}</span>
          </div>
          <p className="mb-4 text-xs text-secondary">
            El total final (con promociones aplicadas) se calcula al confirmar la venta.
          </p>
          <Button
            className="w-full"
            onClick={() => void onConfirmSale()}
            loading={confirming}
            disabled={!warehouseId || lines.length === 0 || missingRequiredCustomField}
          >
            Confirmar venta
          </Button>
        </Card>
      </div>

      {variantPicker && (
        <Modal open title={`Elegir variante — ${variantPicker.product.name}`} onClose={() => setVariantPicker(null)}>
          <div className="flex flex-col gap-2">
            {variantPicker.variants.length === 0 && (
              <p className="text-sm text-secondary">Este producto no tiene variantes creadas.</p>
            )}
            {variantPicker.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  addLine({ variantId: v.id, name: `${variantPicker.product.name} (variante)` });
                  setVariantPicker(null);
                }}
                className="flex items-center justify-between rounded-md border border-outline px-3 py-2 text-left text-sm hover:bg-surface-container"
              >
                <span>Costo {v.cost}</span>
                <span>{v.listPrice ?? "—"}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PosCart;
