import { useState } from "react";
import { Plus, Trash2, Award } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { BrandsApi, type Brand } from "@/pages/products/api/products.api";
import { useBrands } from "@/pages/products/hooks/products.hook";

export function BrandsTab() {
  const { brands, loading, refetch } = useBrands();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await BrandsApi.create({ name });
      notifySuccess("Marca creada");
      setOpen(false);
      setName("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la marca");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await BrandsApi.remove(id);
      notifySuccess("Marca eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la marca");
    }
  }

  const columns: TableColumn<Brand>[] = [
    { key: "name", header: "Nombre", render: (b) => b.name },
    { key: "active", header: "Estado", render: (b) => (b.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <button
          type="button"
          onClick={() => void onDelete(b.id)}
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
          Nueva marca
        </Button>
      </div>

      {!loading && brands.length === 0 ? (
        <EmptyState icon={Award} title="Sin marcas" description="Crea la primera marca para tu catálogo." />
      ) : (
        <Table columns={columns} rows={brands} rowKey={(b) => b.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva marca"
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
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}

export default BrandsTab;
