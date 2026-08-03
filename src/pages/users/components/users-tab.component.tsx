import { useState } from "react";
import { Plus, Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/button/button.component";
import { Table, type TableColumn } from "@/components/table/table.component";
import { Modal } from "@/components/modal/modal.component";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { useAuth } from "@/stores/auth.store";
import { ApiError } from "@/services/http/httpClient";
import { UsersApi, type AppUser } from "@/pages/users/api/users.api";
import { useAppUsers, useRoles } from "@/pages/users/hooks/users.hook";
import { useBusinesses } from "@/pages/business/hooks/business.hook";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  businessId: "",
};

export function UsersTab() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin ?? false;

  const { businesses } = useBusinesses();
  const [targetBusinessId, setTargetBusinessId] = useState("");
  const effectiveBusinessId = isSuperAdmin ? targetBusinessId || undefined : undefined;

  const { users, loading, refetch } = useAppUsers(effectiveBusinessId);
  const { notifyError, notifySuccess } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Roles del formulario: dependen de la empresa elegida DENTRO del modal
  // (que puede ser distinta de la empresa por la que se está filtrando la lista).
  const formBusinessId = isSuperAdmin ? form.businessId || undefined : undefined;
  const { roles: formRoles } = useRoles(formBusinessId);

  function openCreateModal() {
    setForm({ ...emptyForm, businessId: targetBusinessId });
    setOpen(true);
  }

  async function onCreate() {
    setSaving(true);
    try {
      await UsersApi.create({
        name: form.name,
        email: form.email,
        password: form.password,
        roleId: form.roleId || undefined,
        businessId: formBusinessId,
      });
      notifySuccess("Usuario creado");
      setOpen(false);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(u: AppUser) {
    try {
      await UsersApi.update(u.id, { active: !u.active });
      notifySuccess(u.active ? "Usuario desactivado" : "Usuario activado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar el usuario");
    }
  }

  async function onDelete(id: string) {
    try {
      await UsersApi.remove(id);
      notifySuccess("Usuario eliminado");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo eliminar el usuario");
    }
  }

  const columns: TableColumn<AppUser>[] = [
    { key: "name", header: "Nombre", render: (u) => u.name },
    { key: "email", header: "Correo", render: (u) => u.email },
    { key: "role", header: "Rol", render: (u) => u.role?.name ?? "Sin rol" },
    { key: "active", header: "Estado", render: (u) => (u.active ? "Activo" : "Inactivo") },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => void onToggleActive(u)}
            className="rounded-md px-2 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            {u.active ? "Desactivar" : "Activar"}
          </button>
          {u.id !== currentUser?.userId && (
            <button
              type="button"
              onClick={() => void onDelete(u.id)}
              className="rounded-md p-1.5 text-danger transition-colors hover:bg-surface-container"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {isSuperAdmin && (
        <div className="mb-4 max-w-sm">
          <Field label="Empresa (superadministrador)">
            <Select
              value={targetBusinessId}
              onChange={(e) => setTargetBusinessId(e.target.value)}
              placeholder="Mi empresa"
              options={businesses.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Field>
        </div>
      )}
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreateModal}>
          <Plus size={15} />
          Nuevo usuario
        </Button>
      </div>

      {!loading && users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="Sin usuarios" description="Crea el primer usuario interno." />
      ) : (
        <Table columns={columns} rows={users} rowKey={(u) => u.id} loading={loading} />
      )}

      <Modal
        open={open}
        title="Nuevo usuario"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void onCreate()}
              loading={saving}
              disabled={!form.name || !form.email || form.password.length < 6}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {isSuperAdmin && (
            <Field label="Empresa a la que pertenecerá">
              <Select
                value={form.businessId}
                onChange={(e) => setForm({ ...form, businessId: e.target.value, roleId: "" })}
                placeholder="Mi empresa"
                options={businesses.map((b) => ({ value: b.id, label: b.name }))}
              />
            </Field>
          )}
          <Field label="Nombre">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Correo">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Contraseña (mínimo 6 caracteres)">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Rol">
            <Select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              placeholder="Sin rol"
              options={formRoles.map((r) => ({ value: r.id, label: r.name }))}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

export default UsersTab;
