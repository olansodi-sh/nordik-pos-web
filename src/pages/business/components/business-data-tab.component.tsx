import { useEffect, useState } from "react";
import { Field } from "@/components/form/field.component";
import { Input } from "@/components/form/input.component";
import { Button } from "@/components/button/button.component";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";
import { BusinessApi } from "@/pages/business/api/business.api";
import { useBusiness } from "@/pages/business/hooks/business.hook";
import { useAuth } from "@/stores/auth.store";

export function BusinessDataTab() {
  const { business, loading, refetch } = useBusiness();
  const { notifyError, notifySuccess } = useToast();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin ?? false;

  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setTaxId(business.taxId ?? "");
      setActive(business.active);
    }
  }, [business]);

  async function onSave() {
    setSaving(true);
    try {
      await BusinessApi.update({ name, taxId: taxId || undefined, active });
      notifySuccess("Datos del negocio actualizados");
      await refetch();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar el negocio");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-secondary">Cargando…</p>;
  }

  if (isSuperAdmin) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <Field label="Nombre del negocio" htmlFor="name">
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="NIT / Identificación tributaria" htmlFor="taxId">
          <Input
            id="taxId"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Opcional"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-outline"
          />
          Negocio activo
        </label>
        <div className="mt-2 flex justify-end">
          <Button onClick={() => void onSave()} loading={saving} disabled={!name.trim()}>
            Guardar cambios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-secondary uppercase tracking-wide">
          Nombre del negocio
        </span>
        <span className="text-base text-on-surface">{business?.name ?? "—"}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-secondary uppercase tracking-wide">
          NIT / Identificación tributaria
        </span>
        <span className="text-base text-on-surface">{business?.taxId ?? "—"}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-secondary uppercase tracking-wide">Estado</span>
        <span className="text-base text-on-surface">{business?.active ? "Activo" : "Inactivo"}</span>
      </div>
    </div>
  );
}

export default BusinessDataTab;
