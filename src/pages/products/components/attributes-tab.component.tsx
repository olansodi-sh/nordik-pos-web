import { useState } from "react";
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
  AttributeDefinitionsApi,
  CategoryAttributesApi,
  type AttributeDefinition,
  type AttributeType,
  type Category,
} from "@/pages/products/api/products.api";
import { useAttributeDefinitions, useCategoryAttributes } from "@/pages/products/hooks/products.hook";

const TYPE_LABELS: Record<AttributeType, string> = {
  text: "Texto",
  number: "Número",
  boolean: "Sí/No",
  select: "Lista de opciones",
};

interface AttributesTabProps {
  categories: Category[];
}

export function AttributesTab({ categories }: AttributesTabProps) {
  const { attributes, loading, refetch } = useAttributeDefinitions();
  const { notifyError, notifySuccess } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [unit, setUnit] = useState("");
  const [isVariant, setIsVariant] = useState(false);
  const [options, setOptions] = useState("");
  const [saving, setSaving] = useState(false);

  const [assignCategoryId, setAssignCategoryId] = useState("");
  const { categoryAttributes, refetch: refetchCategoryAttributes } = useCategoryAttributes(
    assignCategoryId || null,
  );
  const [assignAttributeId, setAssignAttributeId] = useState("");

  async function onCreate() {
    setSaving(true);
    try {
      await AttributeDefinitionsApi.create({
        name,
        type,
        unit: unit || undefined,
        isVariant,
        options: type === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
      });
      notifySuccess("Atributo creado");
      setOpen(false);
      setName("");
      setType("text");
      setUnit("");
      setIsVariant(false);
      setOptions("");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el atributo");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await AttributeDefinitionsApi.remove(id);
      notifySuccess("Atributo eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el atributo");
    }
  }

  async function onAssign() {
    if (!assignCategoryId || !assignAttributeId) return;
    try {
      await CategoryAttributesApi.assign(assignCategoryId, assignAttributeId);
      notifySuccess("Atributo asignado a la categoría");
      setAssignAttributeId("");
      await refetchCategoryAttributes();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo asignar el atributo");
    }
  }

  async function onUnassign(attributeDefinitionId: string) {
    try {
      await CategoryAttributesApi.unassign(assignCategoryId, attributeDefinitionId);
      notifySuccess("Atributo desasignado");
      await refetchCategoryAttributes();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo desasignar el atributo");
    }
  }

  const columns: TableColumn<AttributeDefinition>[] = [
    { key: "name", header: "Nombre", render: (a) => a.name },
    { key: "type", header: "Tipo", render: (a) => TYPE_LABELS[a.type] },
    { key: "unit", header: "Unidad", render: (a) => a.unit ?? "—" },
    { key: "isVariant", header: "Define variante", render: (a) => (a.isVariant ? "Sí" : "No") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <button
          type="button"
          onClick={() => void onDelete(a.id)}
          className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  const assignableAttributes = attributes.filter(
    (a) => !categoryAttributes.some((ca) => ca.attributeDefinitionId === a.id),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Nuevo atributo
          </Button>
        </div>

        {!loading && attributes.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Sin atributos"
            description="Crea atributos (color, talla, voltaje...) para usarlos en tus categorías."
          />
        ) : (
          <Table columns={columns} rows={attributes} rowKey={(a) => a.id} loading={loading} />
        )}
      </div>

      <div className="rounded-xl border border-outline p-6">
        <h3 className="mb-4 text-sm font-semibold text-on-surface">
          Asignar atributos a una categoría
        </h3>
        <div className="mb-4 flex gap-3">
          <Select
            value={assignCategoryId}
            onChange={(e) => setAssignCategoryId(e.target.value)}
            placeholder="Selecciona una categoría"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            className="max-w-xs"
          />
        </div>

        {assignCategoryId && (
          <>
            <ul className="mb-4 flex flex-col gap-2">
              {categoryAttributes.length === 0 && (
                <li className="text-sm text-secondary">Esta categoría no tiene atributos asignados.</li>
              )}
              {categoryAttributes.map((ca) => (
                <li
                  key={ca.attributeDefinitionId}
                  className="flex items-center justify-between rounded-md border border-outline px-3 py-2 text-sm"
                >
                  <span>
                    {ca.attributeDefinition.name}
                    {ca.required ? " (obligatorio)" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => void onUnassign(ca.attributeDefinitionId)}
                    className="text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Select
                value={assignAttributeId}
                onChange={(e) => setAssignAttributeId(e.target.value)}
                placeholder="Selecciona un atributo"
                options={assignableAttributes.map((a) => ({ value: a.id, label: a.name }))}
                className="max-w-xs"
              />
              <Button variant="secondary" onClick={() => void onAssign()} disabled={!assignAttributeId}>
                Asignar
              </Button>
            </div>
          </>
        )}
      </div>

      <Modal
        open={open}
        title="Nuevo atributo"
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
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Color, talla, voltaje..." />
          </Field>
          <Field label="Tipo">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as AttributeType)}
              options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Field>
          <Field label="Unidad (opcional)">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="cm, kg, V..." />
          </Field>
          {type === "select" && (
            <Field label="Opciones (separadas por coma)">
              <Input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Rojo, Verde, Azul" />
            </Field>
          )}
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input type="checkbox" checked={isVariant} onChange={(e) => setIsVariant(e.target.checked)} />
            Este atributo diferencia variantes (ej. talla, color)
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default AttributesTab;
