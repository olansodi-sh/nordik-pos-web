import { useState } from "react";
import { Warehouse as WarehouseIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { WarehousesApi, type Warehouse } from "@/pages/warehouses/api/warehouses.api";
import { useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";

export function WarehousesTab() {
  const { warehouses, loading, refetch } = useWarehouses();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await WarehousesApi.create({ name, location: location || undefined });
      notifySuccess("Bodega creada");
      setOpen(false);
      setName("");
      setLocation("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la bodega");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await WarehousesApi.remove(id);
      notifySuccess("Bodega eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la bodega");
    }
  }

  const columns: TableColumn<Warehouse>[] = [
    { key: "name", header: "Nombre", render: (w) => w.name },
    { key: "location", header: "Ubicación", render: (w) => w.location ?? "—" },
    { key: "active", header: "Estado", render: (w) => (w.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (w) => (
        <button
          type="button"
          onClick={() => void onDelete(w.id)}
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
          Nueva bodega
        </Button>
      </div>
      {!loading && warehouses.length === 0 ? (
        <EmptyState icon={WarehouseIcon} title="Sin bodegas" description="Crea tu primera bodega." />
      ) : (
        <Table columns={columns} rows={warehouses} rowKey={(w) => w.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva bodega"
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
          <Field label="Ubicación (opcional)">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default WarehousesTab;
