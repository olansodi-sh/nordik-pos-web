import { useState } from "react";
import { Building2, Plus } from "lucide-react";
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

const emptyForm = { name: "", taxId: "" };

const CompaniesPage = () => {
  const { businesses, loading, refetch } = useBusinesses();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function onCreate() {
    setSaving(true);
    try {
      await BusinessApi.create({ name: form.name, taxId: form.taxId || undefined });
      notifySuccess("Empresa creada — ya puedes relacionarle usuarios desde Usuarios");
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

  const columns: TableColumn<Business>[] = [
    { key: "name", header: "Nombre", render: (b) => b.name },
    { key: "taxId", header: "NIT", render: (b) => b.taxId ?? "—" },
    { key: "active", header: "Estado", render: (b) => (b.active ? "Activa" : "Inactiva") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <button
          type="button"
          onClick={() => void onToggleActive(b)}
          className="rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          {b.active ? "Desactivar" : "Activar"}
        </button>
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
            description="Crea la primera empresa y luego relaciónale usuarios desde Usuarios."
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
            <Button onClick={() => void onCreate()} loading={saving} disabled={!form.name.trim()}>
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
        </div>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
