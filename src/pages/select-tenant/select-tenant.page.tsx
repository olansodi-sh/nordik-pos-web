import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "@/stores/auth.store";

const SelectTenantPage = () => {
  const { pendingMemberships, selectTenant, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (!pendingMemberships) {
      navigate("/login", { replace: true });
    }
  }, [pendingMemberships, isAuthenticated, navigate]);

  async function onSelect(businessId: string) {
    try {
      await selectTenant(businessId);
      navigate("/dashboard");
    } catch {
      // el error ya queda expuesto por useAuth().error
    }
  }

  if (!pendingMemberships) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-gutter">
      <main className="flex w-full max-w-[440px] flex-col items-center rounded-xl border border-outline bg-surface-lowest p-8">
        <header className="mb-8 flex w-full flex-col items-center text-center">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-primary">Elige una empresa</h1>
          <p className="text-sm text-secondary">Tu cuenta pertenece a más de un negocio.</p>
        </header>

        <div className="flex w-full flex-col gap-2">
          {pendingMemberships.map((m) => (
            <button
              key={m.businessId}
              type="button"
              disabled={loading}
              onClick={() => void onSelect(m.businessId)}
              className="flex items-center gap-3 rounded-md border border-outline px-4 py-3 text-left text-sm text-on-surface transition-colors hover:border-primary hover:bg-surface-container disabled:opacity-50"
            >
              <Building2 size={18} className="text-primary" />
              {m.businessName}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </main>
    </div>
  );
};

export default SelectTenantPage;
