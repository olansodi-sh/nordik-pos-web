import { useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useAuth } from "@/stores/auth.store";
import { useToast } from "@/components/toast/toast.store";
import { ApiError } from "@/services/http/httpClient";

export function TenantSwitcher() {
  const { user, memberships, selectTenant, loading } = useAuth();
  const { notifyError } = useToast();
  const [open, setOpen] = useState(false);

  if (memberships.length <= 1) return null;

  const current = memberships.find((m) => m.businessId === user?.businessId);

  async function onPick(businessId: string) {
    setOpen(false);
    if (businessId === user?.businessId) return;
    try {
      await selectTenant(businessId);
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "No se pudo cambiar de empresa");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-2 rounded-md border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <Building2 size={14} />
        {current?.businessName ?? "Elegir empresa"}
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-1 min-w-[200px] overflow-hidden rounded-md border border-outline bg-surface-lowest shadow-lg">
            {memberships.map((m) => (
              <button
                key={m.businessId}
                type="button"
                onClick={() => void onPick(m.businessId)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-container ${
                  m.businessId === user?.businessId ? "font-semibold text-primary" : "text-on-surface"
                }`}
              >
                <Building2 size={14} className="shrink-0" />
                {m.businessName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TenantSwitcher;
