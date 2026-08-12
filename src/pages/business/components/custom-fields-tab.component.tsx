import { useEffect, useState } from "react";
import { Plus, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import {
  CustomFieldsApi,
  type CustomFieldDefinition,
  type CustomFieldType,
  type CustomizableEntityType,
} from "@/pages/business/api/custom-fields.api";
import { useCustomFields } from "@/pages/business/hooks/business.hook";

const TYPE_LABELS: Record<CustomFieldType, string> = {
  text: "Texto",
  number: "Número",
  boolean: "Verdadero/falso",
  date: "Fecha",
  select: "Lista de opciones",
};

const emptyForm = {
  key: "",
  label: "",
  type: "text" as CustomFieldType,
  required: false,
  optionsText: "",
};

interface CustomFieldsTabProps {
  entityType?: CustomizableEntityType;
  helpText?: string;
  requiredHelpText?: string;
}

export function CustomFieldsTab({
  entityType = "sale",
  helpText = 'Agrega campos propios al formulario de venta (ej. "Fecha de vencimiento", "Nota de entrega"). Se piden al registrar una venta y quedan guardados con ella.',
  requiredHelpText = "Obligatorio al registrar la venta",
}: CustomFieldsTabProps = {}) {
  const { fields, loading, refetch } = useCustomFields(entityType);
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomFieldDefinition | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        key: editing.key,
        label: editing.label,
        type: editing.type,
        required: editing.required,
        optionsText: (editing.options ?? []).join(", "),
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing]);

  function openCreateModal() {
    setEditing(null);
    setOpen(true);
  }

  async function onSave() {
    setSaving(true);
    try {
      const options =
        form.type === "select"
          ? form.optionsText
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined;

      if (editing) {
        await CustomFieldsApi.update(editing.id, {
          label: form.label,
          type: form.type,
          required: form.required,
          options,
        });
        notifySuccess("Campo actualizado");
      } else {
        await CustomFieldsApi.create({
          entityType,
          key: form.key,
          label: form.label,
          type: form.type,
          required: form.required,
          options,
        });
        notifySuccess("Campo creado");
      }
      setOpen(false);
      setEditing(null);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo guardar el campo");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await CustomFieldsApi.remove(id);
      notifySuccess("Campo eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el campo");
    }
  }

  const columns: TableColumn<CustomFieldDefinition>[] = [
    { key: "label", header: "Etiqueta", render: (f) => f.label },
    { key: "key", header: "Clave", render: (f) => <code className="text-xs">{f.key}</code> },
    { key: "type", header: "Tipo", render: (f) => TYPE_LABELS[f.type] },
    { key: "required", header: "Obligatorio", render: (f) => (f.required ? "Sí" : "No") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (f) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setEditing(f);
              setOpen(true);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => void onDelete(f.id)}
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
      <p className="mb-4 text-xs text-secondary">{helpText}</p>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>
          <Plus size={15} />
          Nuevo campo
        </Button>
      </div>

      {!loading && fields.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="Sin campos personalizados"
          description="Aún no has agregado campos propios a las ventas."
        />
      ) : (
        <Table columns={columns} rows={fields} rowKey={(f) => f.id} loading={loading} />
      )}

      <Modal
        open={open}
        title={editing ? `Editar campo — ${editing.label}` : "Nuevo campo personalizado"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onSave()}
              loading={saving}
              disabled={!form.label.trim() || (!editing && !form.key.trim())}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Etiqueta (lo que ve el usuario)">
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </Field>
          {!editing && (
            <Field label="Clave interna (sin espacios, ej. notaEntrega)">
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.replace(/\s+/g, "") })}
              />
            </Field>
          )}
          <Field label="Tipo de dato">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CustomFieldType })}
              options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Field>
          {form.type === "select" && (
            <Field label="Opciones (separadas por coma)">
              <Input
                value={form.optionsText}
                onChange={(e) => setForm({ ...form, optionsText: e.target.value })}
                placeholder="Opción A, Opción B, Opción C"
              />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
              className="h-4 w-4 rounded border-outline"
            />
            {requiredHelpText}
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default CustomFieldsTab;
