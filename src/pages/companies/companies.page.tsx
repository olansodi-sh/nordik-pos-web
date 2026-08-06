import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header/page-header.component";
import { Card } from "@/components/cards/card.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Button } from "@/components/button/button.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { BusinessApi, type Business } from "@/pages/business/api/business.api";
import { useBusinesses } from "@/pages/business/hooks/business.hook";

const MAX_ADMINS = 2;
const emptyAdmin = { name: "", email: "", password: "" };
const emptyForm = { name: "", taxId: "", admins: [{ ...emptyAdmin }] };

function isAdminComplete(admin: { name: string; email: string; password: string }) {
  return admin.name.trim() !== "" && admin.email.trim() !== "" && admin.password.length >= 6;
}

const CompaniesPage = () => {
  const { businesses, loading, refetch } = useBusinesses();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await BusinessApi.create({
        name: form.name,
        taxId: form.taxId || undefined,
        admins: form.admins,
      });
      notifySuccess(
        form.admins.length > 1 ? "Empresa creada con sus administradores" : "Empresa creada con su administrador",
      );
      setOpen(false);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear la empresa");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(b: Business) {
    try {
      await BusinessApi.updateById(b.id, { active: !b.active });
      notifySuccess(b.active ? "Empresa desactivada" : "Empresa activada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar la empresa");
    }
  }

  async function onDelete(b: Business) {
    try {
      await BusinessApi.remove(b.id);
      notifySuccess("Empresa eliminada");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar la empresa");
    }
  }

  function updateAdmin(index: number, patch: Partial<(typeof emptyAdmin)>) {
    setForm((prev) => ({
      ...prev,
      admins: prev.admins.map((admin, i) => (i === index ? { ...admin, ...patch } : admin)),
    }));
  }

  function addAdmin() {
    setForm((prev) => ({ ...prev, admins: [...prev.admins, { ...emptyAdmin }] }));
  }

  function removeAdmin(index: number) {
    setForm((prev) => ({ ...prev, admins: prev.admins.filter((_, i) => i !== index) }));
  }

  const canCreate = form.name.trim() !== "" && form.admins.every(isAdminComplete);

  const columns: TableColumn<Business>[] = [
    { key: "name", header: "Nombre", render: (b) => b.name },
    { key: "taxId", header: "NIT", render: (b) => b.taxId ?? "—" },
    { key: "active", header: "Estado", render: (b) => (b.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => void onToggleActive(b)}
            className="rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {b.active ? "Desactivar" : "Activar"}
          </button>
          <button
            type="button"
            onClick={() => void onDelete(b)}
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
      <PageHeader
        title="Empresas"
        description="Crea y administra los negocios (tenants) que operan en NordikHat POS"
        icon={Building2}
      />
      <Card>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nueva empresa
          </Button>
        </div>

        {!loading && businesses.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Sin empresas"
            description="Crea la primera empresa y asígnale su administrador."
          />
        ) : (
          <Table columns={columns} rows={businesses} rowKey={(b) => b.id} loading={loading} />
        )}
      </Card>

      <Modal
        open={open}
        title="Nueva empresa"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onCreate()} loading={saving} disabled={!canCreate}>
              Crear empresa
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nombre de la empresa">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="NIT (opcional)">
            <Input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
          </Field>

          <div className="flex flex-col gap-3 border-t border-outline-variant pt-4">
            {form.admins.map((admin, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-md bg-surface-container-low p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    Administrador {index + 1}
                  </span>
                  {form.admins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdmin(index)}
                      className="rounded-md p-1 text-danger transition-colors hover:bg-surface-container"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <Field label="Nombre">
                  <Input
                    value={admin.name}
                    onChange={(e) => updateAdmin(index, { name: e.target.value })}
                  />
                </Field>
                <Field label="Correo">
                  <Input
                    type="email"
                    value={admin.email}
                    onChange={(e) => updateAdmin(index, { email: e.target.value })}
                  />
                </Field>
                <Field label="Contraseña (mínimo 6 caracteres)">
                  <Input
                    type="password"
                    value={admin.password}
                    onChange={(e) => updateAdmin(index, { password: e.target.value })}
                  />
                </Field>
              </div>
            ))}

            {form.admins.length < MAX_ADMINS && (
              <Button variant="secondary" onClick={addAdmin}>
                <Plus size={15} />
                Agregar otro administrador
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
