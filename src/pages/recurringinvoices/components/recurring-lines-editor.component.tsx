import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import type { Product } from "@/pages/products/api/products.api";
import type { RecurringInvoiceLine } from "@/pages/recurringinvoices/api/recurringinvoices.api";

interface RecurringLinesEditorProps {
  products: Product[];
  lines: RecurringInvoiceLine[];
  onChange: (lines: RecurringInvoiceLine[]) => void;
}

export function RecurringLinesEditor({ products, lines, onChange }: RecurringLinesEditorProps) {
  const stockableProducts = products;

  function addLine() {
    onChange([...lines, { productId: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateLine(index: number, patch: Partial<RecurringInvoiceLine>) {
    onChange(lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, i) => (
        <div key={i} className="grid grid-cols-[1fr_100px_120px_32px] items-end gap-2">
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
          <Field label="Precio unitario">
            <Input
              type="number"
              value={line.unitPrice}
              onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
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
  );
}

export default RecurringLinesEditor;
