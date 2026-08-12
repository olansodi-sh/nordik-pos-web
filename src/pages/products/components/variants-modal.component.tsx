import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Modal } from "@/components/modal/modal.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { ProductVariantsApi, type Product, type ProductVariant } from "@/pages/products/api/products.api";
import { useProductVariants } from "@/pages/products/hooks/products.hook";

interface VariantsModalProps {
  product: Product;
  onClose: () => void;
}

export function VariantsModal({ product, onClose }: VariantsModalProps) {
  const { variants, loading, refetch } = useProductVariants(product.id);
  const { notifyError, notifySuccess } = useToast();

  const [cost, setCost] = useState("0");
  const [listPrice, setListPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await ProductVariantsApi.create(product.id, {
        cost: cost ? Number(cost) : 0,
        listPrice: listPrice ? Number(listPrice) : undefined,
      });
      notifySuccess("Variante creada");
      setCost("0");
      setListPrice("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la variante");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(variantId: string) {
    try {
      await ProductVariantsApi.remove(product.id, variantId);
      notifySuccess("Variante eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la variante");
    }
  }

  const columns: TableColumn<ProductVariant>[] = [
    { key: "cost", header: "Costo", render: (v) => v.cost },
    { key: "listPrice", header: "Precio lista", render: (v) => v.listPrice ?? "—" },
    { key: "discount", header: "Descuento %", render: (v) => v.discountPercent },
    { key: "active", header: "Estado", render: (v) => (v.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (v) => (
        <button
          type="button"
          onClick={() => void onDelete(v.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <Modal open title={`Variantes — ${product.name}`} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <Table columns={columns} rows={variants} rowKey={(v) => v.id} loading={loading} emptyMessage="Sin variantes." />

        <div className="rounded-xl border border-outline p-4">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">Nueva variante</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Costo">
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            </Field>
            <Field label="Precio de lista">
              <Input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)} />
            </Field>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => void onCreate()} loading={saving}>
              <Plus size={15} />
              Agregar variante
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default VariantsModal;
