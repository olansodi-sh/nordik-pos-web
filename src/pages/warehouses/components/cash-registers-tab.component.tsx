import { useState } from "react";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CashRegistersApi, type CashRegister } from "@/pages/warehouses/api/cash-registers.api";
import { useCashRegisters, useWarehouses } from "@/pages/warehouses/hooks/warehouses.hook";

export function CashRegistersTab() {
  const { registers, loading, refetch } = useCashRegisters();
  const { warehouses } = useWarehouses();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await CashRegistersApi.create({ name, warehouseId });
      notifySuccess("Caja creada");
      setOpen(false);
      setName("");
      setWarehouseId("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la caja");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await CashRegistersApi.remove(id);
      notifySuccess("Caja eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la caja");
    }
  }

  const columns: TableColumn<CashRegister>[] = [
    { key: "name", header: "Nombre", render: (r) => r.name },
    {
      key: "warehouse",
      header: "Bodega",
      render: (r) => warehouses.find((w) => w.id === r.warehouseId)?.name ?? "—",
    },
    { key: "active", header: "Estado", render: (r) => (r.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <button
          type="button"
          onClick={() => void onDelete(r.id)}
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
          Nueva caja
        </Button>
      </div>
      {!loading && registers.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin cajas"
          description="Crea cajas con nombre propio para cada bodega (ej. Caja 1, Caja 2)."
        />
      ) : (
        <Table columns={columns} rows={registers} rowKey={(r) => r.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nueva caja"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!name || !warehouseId}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Bodega">
            <Select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder="Selecciona una bodega"
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Field>
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Caja 1" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default CashRegistersTab;
