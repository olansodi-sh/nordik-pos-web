import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  LoginApi,
  type AuthenticatedUser,
  type MembershipOption,
} from "@/pages/login/api/login.api";
import { ApiError, getStoredToken, setStoredToken } from "@/services/http/httpClient";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  bootstrapping: boolean;
  error: string;
  pendingMemberships: MembershipOption[] | null;
  memberships: MembershipOption[];
  menuAccess: Record<string, boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  selectTenant: (businessId: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canSeeMenu: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [menuAccess, setMenuAccess] = useState<Record<string, boolean>>({});
  const [memberships, setMemberships] = useState<MembershipOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState("");
  const [pendingMemberships, setPendingMemberships] = useState<MembershipOption[] | null>(null);

  async function loadUserAndMenu() {
    const me = await LoginApi.me();
    // Un token "pre-auth" (sin businessId) sigue siendo válido pero no debe
    // dejar entrar a la app — hace falta terminar de elegir empresa.
    if (!me.businessId) {
      setStoredToken(null);
      return;
    }
    const [access, myMemberships] = await Promise.all([
      LoginApi.myMenuAccess(),
      LoginApi.myMemberships(),
    ]);
    setUser(me);
    setMenuAccess(access);
    setMemberships(myMemberships);
  }

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }

    loadUserAndMenu()
      .catch(() => setStoredToken(null))
      .finally(() => setBootstrapping(false));
  }, []);

  /** Devuelve true si el login quedó completo; false si falta elegir empresa. */
  async function login(email: string, password: string): Promise<boolean> {
    setError("");
    setLoading(true);
    try {
      const result = await LoginApi.login({ email, password });
      setStoredToken(result.accessToken);

      if ("requiresTenantSelection" in result) {
        setPendingMemberships(result.memberships);
        return false;
      }

      await loadUserAndMenu();
      return true;
    } catch (err) {
      setStoredToken(null);
      setError(err instanceof ApiError ? err.message : "Credenciales inválidas");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /** También sirve para cambiar de empresa ya con sesión iniciada (ver TenantSwitcher). */
  async function selectTenant(businessId: string) {
    setError("");
    setLoading(true);
    try {
      const { accessToken } = await LoginApi.selectTenant(businessId);
      setStoredToken(accessToken);
      await loadUserAndMenu();
      setPendingMemberships(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo seleccionar la empresa");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
    setMenuAccess({});
    setMemberships([]);
    setPendingMemberships(null);
  }

  function hasPermission(permission: string) {
    return user?.permissions.includes(permission) ?? false;
  }

  /** Sin entrada en el mapa (aún no cargó, o el negocio nunca sembró la regla) se asume visible. */
  function canSeeMenu(key: string) {
    return menuAccess[key] ?? true;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        bootstrapping,
        error,
        pendingMemberships,
        memberships,
        menuAccess,
        login,
        selectTenant,
        logout,
        hasPermission,
        canSeeMenu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
