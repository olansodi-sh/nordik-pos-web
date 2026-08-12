import { useState } from "react";
import { Plus, Trash2, Percent } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import {
  PromotionsApi,
  type Promotion,
  type PromotionScope,
  type PromotionType,
} from "@/pages/pricelist/api/pricelist.api";
import { usePromotions } from "@/pages/pricelist/hooks/pricelist.hook";
import { useCategories, useProducts } from "@/pages/products/hooks/products.hook";

const TYPE_LABELS: Record<PromotionType, string> = {
  percentage: "Porcentaje",
  fixed_amount: "Monto fijo",
  buy_x_get_y: "Lleva X, paga Y (2x1 y similares)",
};

const SCOPE_LABELS: Record<PromotionScope, string> = {
  all: "Todo el catálogo",
  category: "Una categoría",
  product: "Un producto",
};

export function PromotionsTab() {
  const { promotions, loading, refetch } = usePromotions();
  const { categories } = useCategories();
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PromotionType>("percentage");
  const [scope, setScope] = useState<PromotionScope>("all");
  const [value, setValue] = useState("0");
  const [buyQty, setBuyQty] = useState("2");
  const [getQty, setGetQty] = useState("1");
  const [targetId, setTargetId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await PromotionsApi.create({
        name,
        type,
        scope,
        value: type !== "buy_x_get_y" ? Number(value) : undefined,
        conditions: type === "buy_x_get_y" ? { buyQty: Number(buyQty), getQty: Number(getQty) } : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        targets:
          scope !== "all" && targetId
            ? [{ targetType: scope, targetId }]
            : undefined,
      });
      notifySuccess("Promoción creada");
      setOpen(false);
      setName("");
      setValue("0");
      setTargetId("");
      setStartDate("");
      setEndDate("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la promoción");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await PromotionsApi.remove(id);
      notifySuccess("Promoción eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la promoción");
    }
  }

  const columns: TableColumn<Promotion>[] = [
    { key: "name", header: "Nombre", render: (p) => p.name },
    { key: "type", header: "Tipo", render: (p) => TYPE_LABELS[p.type] },
    { key: "scope", header: "Alcance", render: (p) => SCOPE_LABELS[p.scope] },
    {
      key: "value",
      header: "Valor",
      render: (p) =>
        p.type === "buy_x_get_y"
          ? `${p.conditions?.buyQty ?? "?"}x${p.conditions?.getQty ?? "?"}`
          : p.value ?? "—",
    },
    { key: "active", header: "Estado", render: (p) => (p.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <button
          type="button"
          onClick={() => void onDelete(p.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nueva promoción
        </Button>
      </div>

      {!loading && promotions.length === 0 ? (
        <EmptyState icon={Percent} title="Sin promociones" description="Crea tu primera promoción o descuento." />
      ) : (
        <Table columns={columns} rows={promotions} rowKey={(p) => p.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva promoción"
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
          <Field label="Tipo">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as PromotionType)}
              options={Object.entries(TYPE_LABELS).map(([v, label]) => ({ value: v, label }))}
            />
          </Field>

          {type === "buy_x_get_y" ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cantidad que compra (X)">
                <Input type="number" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} />
              </Field>
              <Field label="Cantidad gratis (Y)">
                <Input type="number" value={getQty} onChange={(e) => setGetQty(e.target.value)} />
              </Field>
            </div>
          ) : (
            <Field label={type === "percentage" ? "Porcentaje de descuento" : "Monto de descuento"}>
              <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
          )}

          <Field label="Alcance">
            <Select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value as PromotionScope);
                setTargetId("");
              }}
              options={[
                { value: "all", label: SCOPE_LABELS.all },
                { value: "category", label: SCOPE_LABELS.category },
                { value: "product", label: SCOPE_LABELS.product },
              ]}
            />
          </Field>

          {scope === "category" && (
            <Field label="Categoría">
              <Select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Selecciona una categoría"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
          )}

          {scope === "product" && (
            <Field label="Producto">
              <Select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="Selecciona un producto"
                options={products.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Desde (opcional)">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="Hasta (opcional)">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PromotionsTab;
