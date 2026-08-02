import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CategoriesApi, type Category } from "@/pages/products/api/products.api";
import { useCategories } from "@/pages/products/hooks/products.hook";

export function CategoriesTab() {
  const { categories, loading, refetch } = useCategories();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await CategoriesApi.create({ name, parentId: parentId || undefined });
      notifySuccess("Categoría creada");
      setOpen(false);
      setName("");
      setParentId("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la categoría");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await CategoriesApi.remove(id);
      notifySuccess("Categoría eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la categoría");
    }
  }

  const columns: TableColumn<Category>[] = [
    { key: "name", header: "Nombre", render: (c) => c.name },
    {
      key: "parent",
      header: "Categoría padre",
      render: (c) => categories.find((p) => p.id === c.parentId)?.name ?? "—",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c) => (
        <button
          type="button"
          onClick={() => void onDelete(c.id)}
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
          Nueva categoría
        </Button>
      </div>

      {!loading && categories.length === 0 ? (
        <EmptyState icon={Tag} title="Sin categorías" description="Crea la primera categoría para tu catálogo." />
      ) : (
        <Table columns={columns} rows={categories} rowKey={(c) => c.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva categoría"
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
          <Field label="Categoría padre (opcional)">
            <Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              placeholder="Sin padre"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default CategoriesTab;
