import { useState } from "react";
import { Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { SuppliersApi, type DocType, type Supplier } from "@/pages/thirdparty/api/thirdparty.api";
import { useSuppliers } from "@/pages/thirdparty/hooks/thirdparty.hook";

const DOC_TYPES: DocType[] = ["CC", "NIT", "CE", "PASSPORT"];

const emptyForm = {
  name: "",
  docType: "" as DocType | "",
  docNumber: "",
  email: "",
  phone: "",
  address: "",
};

export function SuppliersTab() {
  const { suppliers, loading, refetch } = useSuppliers();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await SuppliersApi.create({
        name: form.name,
        docType: form.docType || undefined,
        docNumber: form.docNumber || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      notifySuccess("Proveedor creado");
      setOpen(false);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el proveedor");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await SuppliersApi.remove(id);
      notifySuccess("Proveedor eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el proveedor");
    }
  }

  const columns: TableColumn<Supplier>[] = [
    { key: "name", header: "Nombre", render: (s) => s.name },
    { key: "doc", header: "Documento", render: (s) => (s.docType ? `${s.docType} ${s.docNumber ?? ""}` : "—") },
    { key: "email", header: "Correo", render: (s) => s.email ?? "—" },
    { key: "phone", header: "Teléfono", render: (s) => s.phone ?? "—" },
    { key: "active", header: "Estado", render: (s) => (s.active ? "Activo" : "Inactivo") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <button
          type="button"
          onClick={() => void onDelete(s.id)}
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
          Nuevo proveedor
        </Button>
      </div>

      {!loading && suppliers.length === 0 ? (
        <EmptyState icon={Truck} title="Sin proveedores" description="Registra tu primer proveedor." />
      ) : (
        <Table columns={columns} rows={suppliers} rowKey={(s) => s.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nuevo proveedor"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!form.name}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Tipo de documento">
            <Select
              value={form.docType}
              onChange={(e) => setForm({ ...form, docType: e.target.value as DocType })}
              placeholder="Sin documento"
              options={DOC_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Field>
          <Field label="Número de documento">
            <Input value={form.docNumber} onChange={(e) => setForm({ ...form, docNumber: e.target.value })} />
          </Field>
          <Field label="Correo">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Dirección">
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default SuppliersTab;
