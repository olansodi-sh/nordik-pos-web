import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal/modal.component";
import { Button } from "@/components/button/button.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { SalesApi, type CreateSaleLinePayload, type Sale } from "@/pages/sales/api/sales.api";
import { useProducts } from "@/pages/products/hooks/products.hook";

interface AddLinesModalProps {
  sale: Sale;
  onClose: () => void;
  onAdded: () => void;
}

export function AddLinesModal({ sale, onClose, onAdded }: AddLinesModalProps) {
  const { products } = useProducts();
  const { notifyError, notifySuccess } = useToast();
  const [lines, setLines] = useState<CreateSaleLinePayload[]>([{ productId: "", quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  const stockableProducts = products;

  function updateLine(index: number, patch: Partial<CreateSaleLinePayload>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave() {
    setSaving(true);
    try {
      await SalesApi.addLines(
        sale.id,
        lines.filter((l) => l.productId),
      );
      notifySuccess("Productos agregados a la cuenta");
      onAdded();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudieron agregar los productos");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={`Agregar productos — ${sale.label ?? sale.number}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void onSave()} loading={saving} disabled={!lines.some((l) => l.productId)}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_32px] items-end gap-2">
            <Field label="Producto">
              <Select
                value={line.productId ?? ""}
                onChange={(e) => updateLine(i, { productId: e.target.value })}
                placeholder="Selecciona un producto"
                options={stockableProducts.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Field>
            <Field label="Cantidad">
              <Input
                type="number"
                value={line.quantity}
                onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
              />
            </Field>
            <button
              type="button"
              onClick={() => removeLine(i)}
              className="mb-2 rounded-md p-2 text-danger transition-colors hover:bg-surface-container"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <Button variant="secondary" onClick={addLine} className="self-start">
          <Plus size={15} />
          Agregar línea
        </Button>
      </div>
    </Modal>
  );
}

export default AddLinesModal;
