import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { CustomersApi, type Customer, type DocType } from "@/pages/thirdparty/api/thirdparty.api";
import { useCustomers } from "@/pages/thirdparty/hooks/thirdparty.hook";

const DOC_TYPES: DocType[] = ["CC", "NIT", "CE", "PASSPORT"];

const SOURCE_LABELS: Record<string, string> = {
  pos: "Punto de venta",
  ecommerce: "Tienda en línea",
};

const emptyForm = {
  name: "",
  docType: "" as DocType | "",
  docNumber: "",
  email: "",
  phone: "",
  address: "",
};

export function CustomersTab() {
  const { customers, loading, refetch } = useCustomers();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await CustomersApi.create({
        name: form.name,
        docType: form.docType || undefined,
        docNumber: form.docNumber || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      notifySuccess("Cliente creado");
      setOpen(false);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el cliente");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await CustomersApi.remove(id);
      notifySuccess("Cliente eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el cliente");
    }
  }

  const columns: TableColumn<Customer>[] = [
    { key: "name", header: "Nombre", render: (c) => c.name },
    { key: "doc", header: "Documento", render: (c) => (c.docType ? `${c.docType} ${c.docNumber ?? ""}` : "—") },
    { key: "email", header: "Correo", render: (c) => c.email ?? "—" },
    { key: "phone", header: "Teléfono", render: (c) => c.phone ?? "—" },
    { key: "source", header: "Origen", render: (c) => SOURCE_LABELS[c.source] ?? c.source },
    { key: "loyalty", header: "Puntos", render: (c) => c.loyaltyPoints },
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
          Nuevo cliente
        </Button>
      </div>

      {!loading && customers.length === 0 ? (
        <EmptyState icon={Users} title="Sin clientes" description="Registra tu primer cliente." />
      ) : (
        <Table columns={columns} rows={customers} rowKey={(c) => c.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nuevo cliente"
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

export default CustomersTab;
