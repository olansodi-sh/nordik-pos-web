import { useState } from "react";
import { Plus, Trash2, ListTree, Package } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { ProductsApi, type Brand, type Category, type Product } from "@/pages/products/api/products.api";
import { useProducts } from "@/pages/products/hooks/products.hook";
import { useCustomFields } from "@/pages/business/hooks/business.hook";
import { VariantsModal } from "@/pages/products/components/variants-modal.component";

interface ProductsTabProps {
  categories: Category[];
  brands: Brand[];
}

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  unit: "unidad",
  tracksInventory: true,
  hasVariants: false,
  barcode: "",
};

export function ProductsTab({ categories, brands }: ProductsTabProps) {
  const { products, loading, refetch } = useProducts();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null);

  const { fields: customFieldDefs } = useCustomFields("product");

  const missingRequiredCustomField = customFieldDefs.some(
    (f) => f.required && !customFieldValues[f.key],
  );

  async function onCreate() {
    setSaving(true);
    try {
      await ProductsApi.create({
        sku: form.sku,
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        unit: form.unit || undefined,
        tracksInventory: form.tracksInventory,
        hasVariants: form.hasVariants,
        barcode: !form.hasVariants && form.barcode ? form.barcode : undefined,
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
      });
      notifySuccess("Producto creado");
      setOpen(false);
      setForm(emptyForm);
      setCustomFieldValues({});
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el producto");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await ProductsApi.remove(id);
      notifySuccess("Producto eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el producto");
    }
  }

  const columns: TableColumn<Product>[] = [
    { key: "sku", header: "SKU", render: (p) => p.sku },
    { key: "name", header: "Nombre", render: (p) => p.name },
    {
      key: "category",
      header: "Categoría",
      render: (p) => categories.find((c) => c.id === p.categoryId)?.name ?? "—",
    },
    { key: "unit", header: "Unidad", render: (p) => p.unit },
    { key: "variants", header: "Variantes", render: (p) => (p.hasVariants ? "Sí" : "No") },
    { key: "active", header: "Estado", render: (p) => (p.active ? "Activo" : "Inactivo") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {p.hasVariants && (
            <button
              type="button"
              onClick={() => setVariantsProduct(p)}
              className="rounded-md p-1.5 text-primary transition-colors hover:bg-surface-container"
              title="Ver variantes"
            >
              <ListTree size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => void onDelete(p.id)}
            className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} />
          Nuevo producto
        </Button>
      </div>

      {!loading && products.length === 0 ? (
        <EmptyState icon={Package} title="Sin productos" description="Crea el primer producto de tu catálogo." />
      ) : (
        <Table columns={columns} rows={products} rowKey={(p) => p.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nuevo producto"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onCreate()}
              loading={saving}
              disabled={!form.sku || !form.name || missingRequiredCustomField}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              placeholder="Sin categoría"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          <Field label="Marca">
            <Select
              value={form.brandId}
              onChange={(e) => setForm({ ...form, brandId: e.target.value })}
              placeholder="Sin marca"
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Field>
          <Field label="Unidad">
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Field>
          {!form.hasVariants && (
            <Field label="Código de barras (opcional)">
              <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </Field>
          )}
          <div className="col-span-2 flex flex-col gap-2">
            <Field label="Descripción">
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={form.tracksInventory}
              onChange={(e) => setForm({ ...form, tracksInventory: e.target.checked })}
            />
            Controla inventario
          </label>
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={form.hasVariants}
              onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
            />
            Maneja variantes (talla, color...)
          </label>
          {customFieldDefs.length > 0 && (
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {customFieldDefs.map((f) => {
                const value = customFieldValues[f.key];
                const fieldLabel = `${f.label}${f.required ? " *" : ""}`;
                if (f.type === "boolean") {
                  return (
                    <label key={f.id} className="flex items-center gap-2 text-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) =>
                          setCustomFieldValues((prev) => ({ ...prev, [f.key]: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-outline"
                      />
                      {fieldLabel}
                    </label>
                  );
                }
                if (f.type === "select") {
                  return (
                    <Field key={f.id} label={fieldLabel}>
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
                  <Field key={f.id} label={fieldLabel}>
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
        </div>
      </Modal>

      {variantsProduct && (
        <VariantsModal product={variantsProduct} onClose={() => setVariantsProduct(null)} />
      )}
    </div>
  );
}

export default ProductsTab;
