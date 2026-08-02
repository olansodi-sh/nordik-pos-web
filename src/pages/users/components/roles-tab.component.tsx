import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { RolesApi, type Role } from "@/pages/users/api/users.api";
import { usePermissions, useRoles } from "@/pages/users/hooks/users.hook";

export function RolesTab() {
  const { roles, loading, refetch } = useRoles();
  const { permissions } = usePermissions();
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name);
      setDescription(editingRole.description ?? "");
      setSelectedCodes(new Set(editingRole.permissions.map((p) => p.code)));
    } else {
      setName("");
      setDescription("");
      setSelectedCodes(new Set());
    }
  }, [editingRole]);

  function togglePermission(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        permissionCodes: Array.from(selectedCodes),
      };
      if (editingRole) {
        await RolesApi.update(editingRole.id, payload);
        notifySuccess("Rol actualizado");
      } else {
        await RolesApi.create(payload);
        notifySuccess("Rol creado");
      }
      setOpen(false);
      setEditingRole(null);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo guardar el rol");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await RolesApi.remove(id);
      notifySuccess("Rol eliminado");
      await refetch();
    } catch (err) {
      notifyError(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el rol (verifica que no tenga usuarios asignados)",
      );
    }
  }

  const columns: TableColumn<Role>[] = [
    { key: "name", header: "Nombre", render: (r) => r.name },
    { key: "description", header: "Descripción", render: (r) => r.description ?? "—" },
    { key: "permissions", header: "Permisos", render: (r) => r.permissions.length },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingRole(r);
              setOpen(true);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-surface-container"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => void onDelete(r.id)}
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
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setEditingRole(null);
            setOpen(true);
          }}
        >
          <Plus size={15} />
          Nuevo rol
        </Button>
      </div>

      {!loading && roles.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="Sin roles" description="Crea roles para asignar a tus usuarios." />
      ) : (
        <Table columns={columns} rows={roles} rowKey={(r) => r.id} loading={loading} />
      )}

      <Modal
        open={open}
        title={editingRole ? `Editar rol — ${editingRole.name}` : "Nuevo rol"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onSave()} loading={saving} disabled={!name}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Descripción (opcional)">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Permisos
            </p>
            <div className="grid max-h-64 grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto rounded-md border border-outline p-3">
              {permissions.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={selectedCodes.has(p.code)}
                    onChange={() => togglePermission(p.code)}
                  />
                  {p.code}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RolesTab;
