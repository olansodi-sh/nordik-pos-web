import { Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar.component";
import { useAuth } from "@/stores/auth.store";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-4 border-b border-outline bg-surface-lowest px-8 py-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-on-surface">{user?.name}</p>
            <p className="text-xs text-secondary">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md border border-outline px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
