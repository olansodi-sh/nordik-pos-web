import { useMemo, useState } from "react";
import { LayoutGrid, Lock, ShieldOff, Sparkles } from "lucide-react";
import { Field } from "@/components/form/field.component";
import { Select } from "@/components/form/select.component";
import { EmptyState } from "@/components/empty-state/empty-state.component";
import { useToast } from "@/components/toast/toast.store";
import { useAuth } from "@/stores/auth.store";
import { ApiError } from "@/services/http/httpClient";
import { MenuAccessApi, type MenuAccessEffect, type MenuItem } from "@/pages/users/api/menu-access.api";
import { useAppUsers, useMenuItems, useMenuRulesForUser } from "@/pages/users/hooks/users.hook";
import { useBusinesses } from "@/pages/business/hooks/business.hook";

type EffectOrInherit = MenuAccessEffect | "inherit";

const EFFECT_OPTIONS: { value: EffectOrInherit; label: string }[] = [
  { value: "inherit", label: "Heredar" },
  { value: "allow", label: "Permitir" },
  { value: "deny", label: "Denegar" },
];

function SegmentedEffect({
  value,
  onChange,
  disabled,
}: {
  value: EffectOrInherit;
  onChange: (v: EffectOrInherit) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-outline">
      {EFFECT_OPTIONS.map((opt, i) => {
        const active = value === opt.value;
        const activeClasses =
          opt.value === "deny"
            ? "bg-danger text-white"
            : opt.value === "allow"
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface";
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              i > 0 ? "border-l border-outline" : ""
            } ${active ? activeClasses : "text-on-surface-variant hover:bg-surface-container"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function MenuAccessTab() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.isSuperAdmin ?? false;

  const { businesses } = useBusinesses();
  const [targetBusinessId, setTargetBusinessId] = useState("");
  const effectiveBusinessId = isSuperAdmin ? targetBusinessId || undefined : undefined;

  const { users, loading: usersLoading } = useAppUsers(effectiveBusinessId);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { items, loading: itemsLoading } = useMenuItems();
  const { rules, loading: rulesLoading, refetch: refetchRules } = useMenuRulesForUser(
    selectedUserId || undefined,
  );
  const { notifyError, notifySuccess } = useToast();
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  const groups = useMemo(() => items.filter((i) => !i.parentId), [items]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      if (!item.parentId) continue;
      const list = map.get(item.parentId) ?? [];
      list.push(item);
      map.set(item.parentId, list);
    }
    return map;
  }, [items]);
  const ruleByItemId = useMemo(() => {
    const map = new Map<string, MenuAccessEffect>();
    for (const r of rules) map.set(r.menuItemId, r.effect);
    return map;
  }, [rules]);

  async function onChangeEffect(item: MenuItem, value: EffectOrInherit) {
    if (!selectedUserId) return;
    setSavingItemId(item.id);
    try {
      await MenuAccessApi.setRuleForUser(selectedUserId, item.id, value === "inherit" ? null : value);
      notifySuccess(`Acceso a "${item.label}" actualizado`);
      await refetchRules();
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo actualizar el acceso");
    } finally {
      setSavingItemId(null);
    }
  }

  const loading = usersLoading || itemsLoading;

  return (
    <div>
      <p className="mb-4 flex items-start gap-2 rounded-md bg-surface-container px-4 py-3 text-xs text-on-surface-variant">
        <Sparkles size={15} className="mt-0.5 shrink-0 text-primary" />
        Define qué pantallas ve cada usuario, independientemente de su rol (el rol solo decide qué
        acciones puede hacer). Un ítem sin regla propia hereda lo que tenga su grupo; sin ninguna
        regla en toda la cadena, queda oculto por defecto.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-4">
        {isSuperAdmin && (
          <Field label="Empresa (superadministrador)">
            <Select
              value={targetBusinessId}
              onChange={(e) => {
                setTargetBusinessId(e.target.value);
                setSelectedUserId("");
              }}
              placeholder="Mi empresa"
              options={businesses.map((b) => ({ value: b.id, label: b.name }))}
              className="min-w-[220px]"
            />
          </Field>
        )}
        <Field label="Usuario">
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder={loading ? "Cargando…" : "Elige un usuario"}
            options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
            className="min-w-[260px]"
          />
        </Field>
      </div>

      {!selectedUserId ? (
        <EmptyState
          icon={LayoutGrid}
          title="Elige un usuario"
          description="Selecciona un usuario para configurar qué pantallas puede ver."
        />
      ) : (
        <div className="flex flex-col gap-1 rounded-md border border-outline">
          {groups.map((group) => {
            const children = childrenByParent.get(group.id) ?? [];
            const groupValue: EffectOrInherit = ruleByItemId.get(group.id) ?? "inherit";
            return (
              <div key={group.id} className="border-b border-outline last:border-b-0">
                <div className="flex items-center justify-between gap-4 bg-surface-container px-4 py-2.5">
                  <span className="text-sm font-semibold text-on-surface">{group.label}</span>
                  <SegmentedEffect
                    value={groupValue}
                    disabled={rulesLoading || savingItemId === group.id}
                    onChange={(v) => void onChangeEffect(group, v)}
                  />
                </div>
                <div className="divide-y divide-outline">
                  {children.map((leaf) => {
                    const leafValue: EffectOrInherit = ruleByItemId.get(leaf.id) ?? "inherit";
                    const blockedForUser = leaf.superAdminOnly && !isSuperAdmin;
                    return (
                      <div
                        key={leaf.id}
                        className="flex items-center justify-between gap-4 py-2 pl-8 pr-4"
                      >
                        <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                          {leaf.label}
                          {leaf.superAdminOnly && (
                            <span
                              title="Solo superadministradores"
                              className="flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-outline-strong"
                            >
                              <Lock size={10} />
                              Superadmin
                            </span>
                          )}
                        </span>
                        {blockedForUser ? (
                          <span className="flex items-center gap-1 text-xs text-outline-strong">
                            <ShieldOff size={13} />
                            No disponible
                          </span>
                        ) : (
                          <SegmentedEffect
                            value={leafValue}
                            disabled={rulesLoading || savingItemId === leaf.id}
                            onChange={(v) => void onChangeEffect(leaf, v)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MenuAccessTab;
